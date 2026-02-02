'use server';

/**
 * @fileOverview An AI tool to monitor bookings and communications to detect and prevent users from trying to circumvent the app's commission system.
 *
 * - monitorCommissionEnforcement - A function that monitors bookings and communications for commission circumvention.
 * - MonitorCommissionEnforcementInput - The input type for the monitorCommissionEnforcement function.
 * - MonitorCommissionEnforcementOutput - The return type for the monitorCommissionEnforcement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MonitorCommissionEnforcementInputSchema = z.object({
  bookingDetails: z.string().describe('Details of the booking, including dates, prices, and services.'),
  communicationLog: z.string().describe('Log of communications between the seeker, host, and vendor.'),
});
export type MonitorCommissionEnforcementInput = z.infer<typeof MonitorCommissionEnforcementInputSchema>;

const MonitorCommissionEnforcementOutputSchema = z.object({
  isCircumventionAttempt: z
    .boolean()
    .describe('Whether the AI detects an attempt to circumvent the commission system.'),
  reason: z
    .string()
    .describe('The reason for the determination, including specific evidence from the booking details and communication log.'),
});
export type MonitorCommissionEnforcementOutput = z.infer<typeof MonitorCommissionEnforcementOutputSchema>;

export async function monitorCommissionEnforcement(
  input: MonitorCommissionEnforcementInput
): Promise<MonitorCommissionEnforcementOutput> {
  return monitorCommissionEnforcementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'monitorCommissionEnforcementPrompt',
  input: {schema: MonitorCommissionEnforcementInputSchema},
  output: {schema: MonitorCommissionEnforcementOutputSchema},
  prompt: `You are an AI assistant tasked with detecting attempts to circumvent the commission system in a booking platform.

  Analyze the provided booking details and communication logs to identify potential attempts by users to bypass the platform's commission fees.

  Booking Details: {{{bookingDetails}}}
  Communication Log: {{{communicationLog}}}

  Determine if there is an attempt to circumvent the commission system based on the information provided.
  Explain the reasoning behind your determination, citing specific evidence from the booking details and communication log.

  If the booking details and communications suggest an attempt to circumvent the commission system, set isCircumventionAttempt to true. Otherwise, set it to false.
`,
});

const monitorCommissionEnforcementFlow = ai.defineFlow(
  {
    name: 'monitorCommissionEnforcementFlow',
    inputSchema: MonitorCommissionEnforcementInputSchema,
    outputSchema: MonitorCommissionEnforcementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
