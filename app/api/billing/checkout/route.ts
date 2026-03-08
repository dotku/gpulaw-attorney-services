import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth, checkRateLimit } from '@/lib/api-auth';

// Stripe checkout session creation
// Uses Vercel API Gateway pattern for secure billing
export async function POST(request: NextRequest) {
  const auth = await requireApiAuth(request);
  if ('error' in auth && auth.error) return auth.error;

  const rateLimited = await checkRateLimit(auth.user.sub, 10, 60_000);
  if (rateLimited) return rateLimited;

  try {
    const body = await request.json();
    const { planId, interval, locale } = body;

    // TODO: Integrate with Stripe
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    //
    // const priceIds: Record<string, Record<string, string>> = {
    //   starter: { month: 'price_xxx', year: 'price_yyy' },
    //   professional: { month: 'price_xxx', year: 'price_yyy' },
    //   enterprise: { month: 'price_xxx', year: 'price_yyy' },
    // };
    //
    // const session = await stripe.checkout.sessions.create({
    //   mode: 'subscription',
    //   payment_method_types: ['card'],
    //   line_items: [{ price: priceIds[planId][interval], quantity: 1 }],
    //   success_url: `${process.env.APP_BASE_URL}/${locale}/dashboard/billing?success=true`,
    //   cancel_url: `${process.env.APP_BASE_URL}/${locale}/dashboard/billing?canceled=true`,
    //   locale: locale === 'zh-TW' || locale === 'zh-CN' ? 'zh' : 'en',
    // });
    //
    // return NextResponse.json({ url: session.url });

    // For now, return a placeholder response
    return NextResponse.json({
      message: 'Stripe integration pending. Configure STRIPE_SECRET_KEY to enable billing.',
      planId,
      interval,
    }, { status: 200 });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
