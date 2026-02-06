import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { CheckCircle, CreditCard, Download } from "lucide-react";

export default function BillingPage() {
  const invoices = [
    { id: 'INV-001', date: 'June 30, 2024', amount: '$49.00' },
    { id: 'INV-002', date: 'May 30, 2024', amount: '$49.00' },
    { id: 'INV-003', date: 'April 30, 2024', amount: '$49.00' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <Card>
          <CardHeader>
            <CardTitle>Manage Subscription</CardTitle>
            <CardDescription>
              Your current plan, billing details, and invoice history.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg">
                <div>
                    <h3 className="font-bold text-lg">Guide Plan</h3>
                    <p className="text-muted-foreground">Billed monthly. Renews on July 30, 2024.</p>
                </div>
                <div className="text-right mt-2 md:mt-0">
                    <p className="text-2xl font-bold">$49/mo</p>
                </div>
            </div>

            <div className="space-y-2">
                <h4 className="font-semibold">Billing Method</h4>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                    <div>
                        <p className="font-medium">Visa ending in 1234</p>
                        <p className="text-sm text-muted-foreground">Expires 12/2026</p>
                    </div>
                    <Button variant="outline" className="ml-auto">Update</Button>
                </div>
            </div>

             <div className="space-y-2">
                <h4 className="font-semibold">Plan Management</h4>
                 <div className="flex flex-wrap gap-2">
                    <Button variant="outline">Upgrade Plan</Button>
                    <Button variant="outline">Downgrade Plan</Button>
                    <Button variant="ghost">Pause Subscription</Button>
                    <Button variant="destructive">Cancel Subscription</Button>
                </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Invoice History</h4>
              <div className="border rounded-lg">
                <ul className="divide-y">
                  {invoices.map((invoice) => (
                    <li key={invoice.id} className="p-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{invoice.id}</p>
                        <p className="text-sm text-muted-foreground">{invoice.date}</p>
                      </div>
                       <div className="flex items-center gap-4">
                        <p className="font-mono">{invoice.amount}</p>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download Invoice</span>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Card className="bg-secondary/50">
           <CardHeader className="flex flex-row items-start gap-4">
                <Image src="/lux.png" alt="LUX Standard" width={60} height={60} />
                <div>
                    <CardTitle className="font-headline text-3xl">The LUX Standard</CardTitle>
                    <CardDescription className="text-base !mt-2">LUX is a recognition of exceptional quality and experience, not a tier you can buy.</CardDescription>
                </div>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground">
            <p>The LUX Standard is our highest honor, awarded to partners who consistently deliver extraordinary retreat experiences. It is earned through merit and evaluated independently by our team based on a range of quality signals.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">How It Works</h4>
                    <ul className="space-y-2 list-inside">
                        <li className="flex items-start"><CheckCircle className="h-5 w-5 mr-2 mt-0.5 text-primary shrink-0"/><span>Evaluations are performed quietly and based on guest feedback patterns, operational excellence, and lasting impact.</span></li>
                        <li className="flex items-start"><CheckCircle className="h-5 w-5 mr-2 mt-0.5 text-primary shrink-0"/><span>You are not notified when an evaluation is in progress. Recognition is awarded discreetly to preserve its integrity.</span></li>
                        <li className="flex items-start"><CheckCircle className="h-5 w-5 mr-2 mt-0.5 text-primary shrink-0"/><span>There is no fee to be considered, and recognition does not change your subscription terms.</span></li>
                    </ul>
                </div>
                 <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">Benefits of Recognition</h4>
                    <ul className="space-y-2 list-inside">
                        <li className="flex items-start"><CheckCircle className="h-5 w-5 mr-2 mt-0.5 text-primary shrink-0"/><span>A distinguished LUX badge on your profile and listings.</span></li>
                        <li className="flex items-start"><CheckCircle className="h-5 w-5 mr-2 mt-0.5 text-primary shrink-0"/><span>Increased visibility in search, recommendations, and editorial features.</span></li>
                        <li className="flex items-start"><CheckCircle className="h-5 w-5 mr-2 mt-0.5 text-primary shrink-0"/><span>Eligibility for placement in curated LUX collections.</span></li>
                    </ul>
                </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex items-center space-x-2 p-4 border rounded-lg bg-background w-full">
                <Switch id="lux-opt-in" />
                <Label htmlFor="lux-opt-in" className="text-base">Opt in for LUX consideration eligibility.</Label>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
