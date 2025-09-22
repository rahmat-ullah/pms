"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const base_repository_1 = require("./base.repository");
const user_schema_1 = require("../schemas/user.schema");
let UserRepository = class UserRepository extends base_repository_1.BaseRepository {
    constructor(userModel) {
        super(userModel);
        this.userModel = userModel;
    }
    async findByEmail(email) {
        return this.userModel.findOne({ email }).exec();
    }
    async findByEmailWithPassword(email) {
        return this.userModel.findOne({ email }).select('+password').exec();
    }
    async findByRefreshToken(refreshToken) {
        return this.userModel.findOne({ refreshTokens: refreshToken }).exec();
    }
    async findByPasswordResetToken(token) {
        return this.userModel.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: new Date() },
        }).exec();
    }
    async findByEmailVerificationToken(token) {
        return this.userModel.findOne({ emailVerificationToken: token }).exec();
    }
    async searchUsers(options) {
        const { role, status, searchTerm, includeArchived = false, page = 1, limit = 10, sort = { createdAt: -1 }, } = options;
        const filter = {};
        if (role) {
            filter.role = role;
        }
        if (status) {
            filter.status = status;
        }
        if (!includeArchived) {
            filter.archivedAt = { $exists: false };
        }
        if (searchTerm) {
            filter.$or = [
                { firstName: { $regex: searchTerm, $options: 'i' } },
                { lastName: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } },
            ];
        }
        return this.findWithPagination(filter, { page, limit, sort });
    }
    async findByRole(role) {
        return this.userModel.find({ role, archivedAt: { $exists: false } }).exec();
    }
    async findByStatus(status) {
        return this.userModel.find({ status, archivedAt: { $exists: false } }).exec();
    }
    async findActiveUsers() {
        return this.userModel.find({
            status: user_schema_1.UserStatus.ACTIVE,
            archivedAt: { $exists: false },
        }).exec();
    }
    async findUsersWithEmployeeProfile() {
        return this.userModel.find({
            employeeProfile: { $exists: true, $ne: null },
            archivedAt: { $exists: false },
        }).populate('employeeProfile').exec();
    }
    async updateLastLogin(userId) {
        return this.userModel.findByIdAndUpdate(userId, { lastLoginAt: new Date() }, { new: true }).exec();
    }
    async addRefreshToken(userId, refreshToken) {
        await this.userModel.findByIdAndUpdate(userId, {
            $push: { refreshTokens: refreshToken },
        }).exec();
    }
    async removeRefreshToken(userId, refreshToken) {
        await this.userModel.findByIdAndUpdate(userId, {
            $pull: { refreshTokens: refreshToken },
        }).exec();
    }
    async clearAllRefreshTokens(userId) {
        await this.userModel.findByIdAndUpdate(userId, {
            refreshTokens: [],
        }).exec();
    }
    async updatePassword(userId, hashedPassword) {
        await this.userModel.findByIdAndUpdate(userId, {
            password: hashedPassword,
            refreshTokens: [],
        }).exec();
    }
    async setPasswordResetToken(userId, token, expires) {
        await this.userModel.findByIdAndUpdate(userId, {
            passwordResetToken: token,
            passwordResetExpires: expires,
        }).exec();
    }
    async clearPasswordResetToken(userId) {
        await this.userModel.findByIdAndUpdate(userId, {
            $unset: {
                passwordResetToken: 1,
                passwordResetExpires: 1,
            },
        }).exec();
    }
    async verifyEmail(userId) {
        await this.userModel.findByIdAndUpdate(userId, {
            emailVerifiedAt: new Date(),
            $unset: { emailVerificationToken: 1 },
        }).exec();
    }
    async updateStatus(userId, status) {
        return this.userModel.findByIdAndUpdate(userId, { status }, { new: true }).exec();
    }
    async linkEmployeeProfile(userId, employeeProfileId) {
        return this.userModel.findByIdAndUpdate(userId, { employeeProfile: employeeProfileId }, { new: true }).exec();
    }
    async unlinkEmployeeProfile(userId) {
        return this.userModel.findByIdAndUpdate(userId, { $unset: { employeeProfile: 1 } }, { new: true }).exec();
    }
    async getUserStats() {
        const [total, active, inactive, pending, roleStats] = await Promise.all([
            this.count({ archivedAt: { $exists: false } }),
            this.count({ status: user_schema_1.UserStatus.ACTIVE, archivedAt: { $exists: false } }),
            this.count({ status: user_schema_1.UserStatus.INACTIVE, archivedAt: { $exists: false } }),
            this.count({ status: user_schema_1.UserStatus.PENDING, archivedAt: { $exists: false } }),
            this.userModel.aggregate([
                { $match: { archivedAt: { $exists: false } } },
                { $group: { _id: '$role', count: { $sum: 1 } } },
            ]).exec(),
        ]);
        const byRole = Object.values(user_schema_1.UserRole).reduce((acc, role) => {
            acc[role] = 0;
            return acc;
        }, {});
        roleStats.forEach(stat => {
            byRole[stat._id] = stat.count;
        });
        return {
            total,
            active,
            inactive,
            pending,
            byRole,
        };
    }
    async findRecentlyCreated(days = 7) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        return this.userModel.find({
            createdAt: { $gte: since },
            archivedAt: { $exists: false },
        }).sort({ createdAt: -1 }).exec();
    }
    async findInactiveUsers(days = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        return this.userModel.find({
            $or: [
                { lastLoginAt: { $lt: since } },
                { lastLoginAt: { $exists: false }, createdAt: { $lt: since } },
            ],
            status: user_schema_1.UserStatus.ACTIVE,
            archivedAt: { $exists: false },
        }).exec();
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UserRepository);
//# sourceMappingURL=user.repository.js.map