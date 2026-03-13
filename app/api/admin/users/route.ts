import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// Tu email de admin
const ADMIN_EMAILS = ['amir@example.com', 'amirgomez@gmail.com', 'amir.gomez@icloud.com']

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar si es admin
    const adminUser = await prisma.user.findFirst({
      where: { clerkId: userId }
    })

    if (!adminUser || !ADMIN_EMAILS.includes(adminUser.email.toLowerCase())) {
      return NextResponse.json({ error: 'No tienes permisos de admin' }, { status: 403 })
    }

    // Parámetros de paginación y búsqueda
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Construir filtro de búsqueda
    const where = search ? {
      OR: [
        { username: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ]
    } : {}

    // Obtener usuarios
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          clerkId: true,
          username: true,
          email: true,
          plan: true,
          tutorialLevel: true,
          createdAt: true,
          _count: {
            select: {
              campaigns: true,
              sessions: true,
              characters: true,
            }
          },
          campaigns: {
            take: 3,
            orderBy: { updatedAt: 'desc' },
            select: {
              id: true,
              name: true,
              lore: true,
              status: true,
              updatedAt: true,
            }
          },
          sessions: {
            take: 1,
            orderBy: { startedAt: 'desc' },
            select: {
              startedAt: true,
              _count: {
                select: { turns: true }
              }
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
