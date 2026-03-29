import { describe, it, expect } from 'vitest';
import appConfig from '@/config/app.json';

describe('app.json configuration', () => {
  describe('subscription rules', () => {
    it('has pro minimum commitment of 90 days', () => {
      expect(appConfig.subscriptionRules.proMinimumCommitmentDays).toBe(90);
    });

    it('has pro reactivation fee of $99', () => {
      expect(appConfig.subscriptionRules.proReactivationFeeAmount).toBe(99);
    });

    it('has 60-day reactivation window', () => {
      expect(appConfig.subscriptionRules.proReactivationWindowDays).toBe(60);
    });
  });

  describe('plan tiers', () => {
    const roles = ['guide', 'host', 'vendor'] as const;
    const tiers = ['pay-as-you-go', 'starter', 'pro'] as const;

    for (const role of roles) {
      describe(`${role} plans`, () => {
        for (const tier of tiers) {
          it(`has ${tier} plan defined`, () => {
            const plan = appConfig.plans[role][tier];
            expect(plan).toBeDefined();
            expect(plan.name).toBeTruthy();
            expect(plan.platformFeePercent).toBeGreaterThanOrEqual(0);
            expect(plan.benefits).toBeInstanceOf(Array);
            expect(plan.benefits.length).toBeGreaterThan(0);
          });
        }

        it('has decreasing fees from pay-as-you-go → starter → pro', () => {
          const payg = appConfig.plans[role]['pay-as-you-go'].platformFeePercent;
          const starter = appConfig.plans[role]['starter'].platformFeePercent;
          const pro = appConfig.plans[role]['pro'].platformFeePercent;
          expect(payg).toBeGreaterThan(starter);
          expect(starter).toBeGreaterThan(pro);
        });

        it('has increasing prices from pay-as-you-go → starter → pro', () => {
          const payg = appConfig.plans[role]['pay-as-you-go'].price;
          const starter = appConfig.plans[role]['starter'].price;
          const pro = appConfig.plans[role]['pro'].price;
          expect(payg).toBeLessThan(starter);
          expect(starter).toBeLessThan(pro);
        });

        it('pay-as-you-go is free ($0)', () => {
          expect(appConfig.plans[role]['pay-as-you-go'].price).toBe(0);
        });

        it('only pro plan has AI assistant', () => {
          expect(appConfig.plans[role]['pay-as-you-go'].aiAssistant).toBe(false);
          expect(appConfig.plans[role]['starter'].aiAssistant).toBe(false);
          expect(appConfig.plans[role]['pro'].aiAssistant).toBe(true);
        });
      });
    }
  });

  describe('specific fee percentages', () => {
    it('guide fees: 12.5% → 10% → 8%', () => {
      expect(appConfig.plans.guide['pay-as-you-go'].platformFeePercent).toBe(12.5);
      expect(appConfig.plans.guide['starter'].platformFeePercent).toBe(10);
      expect(appConfig.plans.guide['pro'].platformFeePercent).toBe(8);
    });

    it('host fees: 5% → 3% → 2%', () => {
      expect(appConfig.plans.host['pay-as-you-go'].platformFeePercent).toBe(5);
      expect(appConfig.plans.host['starter'].platformFeePercent).toBe(3);
      expect(appConfig.plans.host['pro'].platformFeePercent).toBe(2);
    });

    it('vendor fees: 15% → 12% → 10% → 8%', () => {
      expect(appConfig.plans.vendor['pay-as-you-go'].platformFeePercent).toBe(15);
      expect(appConfig.plans.vendor['starter'].platformFeePercent).toBe(10);
      expect(appConfig.plans.vendor['pro'].platformFeePercent).toBe(8);
    });
  });

  describe('manifestation credit rules', () => {
    it('has 3% credit', () => {
      expect(appConfig.manifestCredit.percent).toBe(0.03);
    });

    it('has $500 cap', () => {
      expect(appConfig.manifestCredit.cap_amount).toBe(500);
    });

    it('uses USD', () => {
      expect(appConfig.manifestCredit.currency).toBe('USD');
    });

    it('valid for 365 days', () => {
      expect(appConfig.manifestCredit.validity_days).toBe(365);
    });

    it('triggers on completed bookings', () => {
      expect(appConfig.manifestCredit.trigger).toBe('completed');
    });
  });
});
