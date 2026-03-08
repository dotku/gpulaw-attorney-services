import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth, checkRateLimit, safeErrorResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = await requireApiAuth(request);
  if ('error' in auth && auth.error) return auth.error;

  const rateLimited = await checkRateLimit(auth.user.sub, 60, 60_000);
  if (rateLimited) return rateLimited;

  try {
    const { user } = auth as { user: { sub: string; email: string; name?: string } };

    // Find user by email (Auth0 sub may differ from DB id)
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      include: {
        clientProfile: true,
        lawyerProfile: {
          include: {
            languages: true,
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!dbUser) {
      // Return basic info from Auth0 if user not yet in DB
      return NextResponse.json({
        success: true,
        data: {
          email: user.email,
          name: user.name || '',
          role: 'CLIENT',
          phone: '',
          image: '',
          locale: 'en',
          clientProfile: null,
          lawyerProfile: null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name || '',
        role: dbUser.role,
        phone: dbUser.phone || '',
        image: dbUser.image || '',
        locale: dbUser.locale || 'en',
        clientProfile: dbUser.clientProfile
          ? {
              firstName: dbUser.clientProfile.firstName || '',
              lastName: dbUser.clientProfile.lastName || '',
              address: dbUser.clientProfile.address || '',
              city: dbUser.clientProfile.city || '',
              state: dbUser.clientProfile.state || '',
              zipCode: dbUser.clientProfile.zipCode || '',
              country: dbUser.clientProfile.country || 'US',
              preferredLocale: dbUser.clientProfile.preferredLocale || 'en',
              timezone: dbUser.clientProfile.timezone || '',
            }
          : null,
        lawyerProfile: dbUser.lawyerProfile
          ? {
              firstName: dbUser.lawyerProfile.firstName || '',
              lastName: dbUser.lawyerProfile.lastName || '',
              barNumber: dbUser.lawyerProfile.barNumber || '',
              barState: dbUser.lawyerProfile.barState || '',
              yearsExperience: dbUser.lawyerProfile.yearsExperience || 0,
              bio: dbUser.lawyerProfile.bio || '',
              hourlyRate: dbUser.lawyerProfile.hourlyRate
                ? Number(dbUser.lawyerProfile.hourlyRate)
                : null,
              consultationFee: dbUser.lawyerProfile.consultationFee
                ? Number(dbUser.lawyerProfile.consultationFee)
                : null,
              officePhone: dbUser.lawyerProfile.officePhone || '',
              officeAddress: dbUser.lawyerProfile.officeAddress || '',
              city: dbUser.lawyerProfile.city || '',
              state: dbUser.lawyerProfile.state || '',
              zipCode: dbUser.lawyerProfile.zipCode || '',
              website: dbUser.lawyerProfile.website || '',
              status: dbUser.lawyerProfile.status,
              languages: dbUser.lawyerProfile.languages.map((l) => l.language),
              categories: dbUser.lawyerProfile.categories.map((c) => ({
                id: c.categoryId,
                key: c.category.key,
                name: c.category.nameEn,
                isPrimary: c.isPrimary,
              })),
            }
          : null,
      },
    });
  } catch (error) {
    return safeErrorResponse(error, 'Failed to fetch profile');
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireApiAuth(request);
  if ('error' in auth && auth.error) return auth.error;

  const rateLimited = await checkRateLimit(auth.user.sub, 20, 60_000);
  if (rateLimited) return rateLimited;

  try {
    const { user } = auth as { user: { sub: string; email: string; name?: string } };

    // Validate body size
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 50_000) {
      return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const {
      name,
      phone,
      image,
      locale,
      // Client fields
      clientProfile,
      // Lawyer fields
      lawyerProfile,
    } = body;

    // Upsert user record
    const dbUser = await prisma.user.upsert({
      where: { email: user.email },
      create: {
        email: user.email,
        name: name || user.name || '',
        phone: phone || null,
        image: image || null,
        locale: locale || 'en',
        role: 'CLIENT',
      },
      update: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(image !== undefined && { image: image || null }),
        ...(locale !== undefined && { locale }),
      },
    });

    // Update client profile if provided
    if (clientProfile) {
      await prisma.clientProfile.upsert({
        where: { userId: dbUser.id },
        create: {
          userId: dbUser.id,
          firstName: clientProfile.firstName || null,
          lastName: clientProfile.lastName || null,
          address: clientProfile.address || null,
          city: clientProfile.city || null,
          state: clientProfile.state || null,
          zipCode: clientProfile.zipCode || null,
          country: clientProfile.country || 'US',
          preferredLocale: clientProfile.preferredLocale || 'en',
          timezone: clientProfile.timezone || null,
        },
        update: {
          ...(clientProfile.firstName !== undefined && { firstName: clientProfile.firstName || null }),
          ...(clientProfile.lastName !== undefined && { lastName: clientProfile.lastName || null }),
          ...(clientProfile.address !== undefined && { address: clientProfile.address || null }),
          ...(clientProfile.city !== undefined && { city: clientProfile.city || null }),
          ...(clientProfile.state !== undefined && { state: clientProfile.state || null }),
          ...(clientProfile.zipCode !== undefined && { zipCode: clientProfile.zipCode || null }),
          ...(clientProfile.country !== undefined && { country: clientProfile.country }),
          ...(clientProfile.preferredLocale !== undefined && { preferredLocale: clientProfile.preferredLocale }),
          ...(clientProfile.timezone !== undefined && { timezone: clientProfile.timezone || null }),
        },
      });
    }

    // Update lawyer profile if provided
    if (lawyerProfile && dbUser.role === 'LAWYER') {
      await prisma.lawyerProfile.upsert({
        where: { userId: dbUser.id },
        create: {
          userId: dbUser.id,
          firstName: lawyerProfile.firstName || '',
          lastName: lawyerProfile.lastName || '',
          barNumber: lawyerProfile.barNumber || '',
          barState: lawyerProfile.barState || '',
          barAdmissionDate: lawyerProfile.barAdmissionDate
            ? new Date(lawyerProfile.barAdmissionDate)
            : new Date(),
          yearsExperience: lawyerProfile.yearsExperience || 0,
          bio: lawyerProfile.bio || null,
          hourlyRate: lawyerProfile.hourlyRate || null,
          consultationFee: lawyerProfile.consultationFee || null,
          officePhone: lawyerProfile.officePhone || null,
          officeAddress: lawyerProfile.officeAddress || null,
          city: lawyerProfile.city || null,
          state: lawyerProfile.state || null,
          zipCode: lawyerProfile.zipCode || null,
          website: lawyerProfile.website || null,
        },
        update: {
          ...(lawyerProfile.firstName !== undefined && { firstName: lawyerProfile.firstName }),
          ...(lawyerProfile.lastName !== undefined && { lastName: lawyerProfile.lastName }),
          ...(lawyerProfile.barNumber !== undefined && { barNumber: lawyerProfile.barNumber }),
          ...(lawyerProfile.barState !== undefined && { barState: lawyerProfile.barState }),
          ...(lawyerProfile.yearsExperience !== undefined && {
            yearsExperience: lawyerProfile.yearsExperience,
          }),
          ...(lawyerProfile.bio !== undefined && { bio: lawyerProfile.bio || null }),
          ...(lawyerProfile.hourlyRate !== undefined && {
            hourlyRate: lawyerProfile.hourlyRate || null,
          }),
          ...(lawyerProfile.consultationFee !== undefined && {
            consultationFee: lawyerProfile.consultationFee || null,
          }),
          ...(lawyerProfile.officePhone !== undefined && {
            officePhone: lawyerProfile.officePhone || null,
          }),
          ...(lawyerProfile.officeAddress !== undefined && {
            officeAddress: lawyerProfile.officeAddress || null,
          }),
          ...(lawyerProfile.city !== undefined && { city: lawyerProfile.city || null }),
          ...(lawyerProfile.state !== undefined && { state: lawyerProfile.state || null }),
          ...(lawyerProfile.zipCode !== undefined && { zipCode: lawyerProfile.zipCode || null }),
          ...(lawyerProfile.website !== undefined && { website: lawyerProfile.website || null }),
        },
      });

      // Update languages if provided
      if (lawyerProfile.languages && Array.isArray(lawyerProfile.languages)) {
        const existingProfile = await prisma.lawyerProfile.findUnique({
          where: { userId: dbUser.id },
        });
        if (existingProfile) {
          // Delete existing languages and recreate
          await prisma.lawyerLanguage.deleteMany({
            where: { lawyerId: existingProfile.id },
          });
          for (const lang of lawyerProfile.languages) {
            await prisma.lawyerLanguage.create({
              data: {
                lawyerId: existingProfile.id,
                language: lang,
                isPrimary: lawyerProfile.languages.indexOf(lang) === 0,
              },
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Profile updated' });
  } catch (error) {
    return safeErrorResponse(error, 'Failed to update profile');
  }
}
