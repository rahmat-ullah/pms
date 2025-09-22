// MongoDB Initialization Script for PMS Development Environment
// This script creates the development database and initial collections

// Switch to the PMS development database
db = db.getSiblingDB('pms_development');

// Create collections with validation schemas
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'role', 'isActive'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'must be a valid email address'
        },
        password: {
          bsonType: 'string',
          minLength: 8,
          description: 'must be a string with minimum 8 characters'
        },
        role: {
          bsonType: 'string',
          enum: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE', 'FINANCE', 'CEO'],
          description: 'must be a valid role'
        },
        isActive: {
          bsonType: 'bool',
          description: 'must be a boolean'
        }
      }
    }
  }
});

db.createCollection('employees', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'firstName', 'lastName', 'employeeId'],
      properties: {
        userId: {
          bsonType: 'objectId',
          description: 'must be a valid ObjectId reference to users collection'
        },
        firstName: {
          bsonType: 'string',
          minLength: 1,
          description: 'must be a non-empty string'
        },
        lastName: {
          bsonType: 'string',
          minLength: 1,
          description: 'must be a non-empty string'
        },
        employeeId: {
          bsonType: 'string',
          description: 'must be a unique employee identifier'
        }
      }
    }
  }
});

db.createCollection('projects', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'status', 'createdBy'],
      properties: {
        name: {
          bsonType: 'string',
          minLength: 1,
          description: 'must be a non-empty string'
        },
        status: {
          bsonType: 'string',
          enum: ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'],
          description: 'must be a valid project status'
        },
        createdBy: {
          bsonType: 'objectId',
          description: 'must be a valid ObjectId reference to users collection'
        }
      }
    }
  }
});

// Create indexes for performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isActive: 1 });
db.users.createIndex({ createdAt: 1 });

db.employees.createIndex({ userId: 1 }, { unique: true });
db.employees.createIndex({ employeeId: 1 }, { unique: true });
db.employees.createIndex({ firstName: 1, lastName: 1 });
db.employees.createIndex({ department: 1 });

db.projects.createIndex({ name: 1 });
db.projects.createIndex({ status: 1 });
db.projects.createIndex({ createdBy: 1 });
db.projects.createIndex({ createdAt: 1 });

// Insert initial seed data for development
const adminUserId = ObjectId();
const hrUserId = ObjectId();
const managerUserId = ObjectId();
const employeeUserId = ObjectId();

// Create initial users
db.users.insertMany([
  {
    _id: adminUserId,
    email: 'admin@pms.com',
    password: '$2b$12$LQv3c1yqBw2uuCD4Gdmu2OWQvAoWjy3d5ExiEsvbdXXs3bbHQJuxO', // password: admin123
    role: 'ADMIN',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: hrUserId,
    email: 'hr@pms.com',
    password: '$2b$12$LQv3c1yqBw2uuCD4Gdmu2OWQvAoWjy3d5ExiEsvbdXXs3bbHQJuxO', // password: admin123
    role: 'HR',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: managerUserId,
    email: 'manager@pms.com',
    password: '$2b$12$LQv3c1yqBw2uuCD4Gdmu2OWQvAoWjy3d5ExiEsvbdXXs3bbHQJuxO', // password: admin123
    role: 'MANAGER',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: employeeUserId,
    email: 'employee@pms.com',
    password: '$2b$12$LQv3c1yqBw2uuCD4Gdmu2OWQvAoWjy3d5ExiEsvbdXXs3bbHQJuxO', // password: admin123
    role: 'EMPLOYEE',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create corresponding employee profiles
db.employees.insertMany([
  {
    userId: adminUserId,
    employeeId: 'EMP001',
    firstName: 'System',
    lastName: 'Administrator',
    email: 'admin@pms.com',
    department: 'IT',
    position: 'System Administrator',
    joinDate: new Date('2024-01-01'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: hrUserId,
    employeeId: 'EMP002',
    firstName: 'HR',
    lastName: 'Manager',
    email: 'hr@pms.com',
    department: 'Human Resources',
    position: 'HR Manager',
    joinDate: new Date('2024-01-01'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: managerUserId,
    employeeId: 'EMP003',
    firstName: 'Project',
    lastName: 'Manager',
    email: 'manager@pms.com',
    department: 'Engineering',
    position: 'Project Manager',
    joinDate: new Date('2024-01-01'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: employeeUserId,
    employeeId: 'EMP004',
    firstName: 'John',
    lastName: 'Developer',
    email: 'employee@pms.com',
    department: 'Engineering',
    position: 'Software Developer',
    joinDate: new Date('2024-01-01'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create a sample project
db.projects.insertOne({
  name: 'Project Management Software Development',
  description: 'Development of the comprehensive PMS system',
  status: 'ACTIVE',
  createdBy: adminUserId,
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  teamMembers: [adminUserId, managerUserId, employeeUserId],
  createdAt: new Date(),
  updatedAt: new Date()
});

print('✅ PMS development database initialized successfully!');
print('📊 Created collections: users, employees, projects');
print('🔍 Created indexes for performance optimization');
print('👥 Inserted seed data: 4 users, 4 employees, 1 project');
print('🔑 Default login credentials:');
print('   - admin@pms.com / admin123 (Admin)');
print('   - hr@pms.com / admin123 (HR)');
print('   - manager@pms.com / admin123 (Manager)');
print('   - employee@pms.com / admin123 (Employee)');
