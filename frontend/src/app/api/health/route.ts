import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health check for the frontend
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'pms-frontend',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
    };

    return NextResponse.json(healthData, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'pms-frontend',
        error: 'Health check failed',
      },
      { status: 503 }
    );
  }
}
