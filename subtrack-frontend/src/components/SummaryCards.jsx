import { useSubscriptionStore } from "../store/subscriptionStore";
import { CalendarDays, ShieldAlert, Sparkles } from "lucide-react";
import StatsCard from "./StatsCard";

function SummaryCards() {
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);

  const activeSubs = subscriptions.filter((sub) => sub.status === "active");
  const totalCount = subscriptions.length;
  
  // Calculate burn rate
  const monthlyTotal = activeSubs.reduce((acc, sub) => {
    const price = sub.price || 0;
    return acc + (sub.billingCycle === "monthly" ? price : price / 12);
  }, 0);

  // Calculate average price
  const averagePrice = activeSubs.length > 0 ? monthlyTotal / activeSubs.length : 0;

  // Find nearest renewal
  let nearestSub = null;
  let nearestDiffDays = Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  activeSubs.forEach((sub) => {
    const renewal = new Date(sub.renewalDate);
    renewal.setHours(0, 0, 0, 0);
    const diffTime = renewal.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 0 && diffDays < nearestDiffDays) {
      nearestDiffDays = diffDays;
      nearestSub = sub;
    }
  });

  const nextRenewalText = nearestSub 
    ? `${nearestSub.serviceName} ($${nearestSub.price})`
    : "No active renewals";

  const nextRenewalSubtitle = nearestSub
    ? nearestDiffDays === 0
      ? "Due today!"
      : nearestDiffDays === 1
      ? "Due tomorrow"
      : `Due in ${nearestDiffDays} days`
    : "All clear";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 select-none">
      <StatsCard
        title="Monthly Burn Rate"
        value={`$${monthlyTotal.toFixed(2)}`}
        subtitle="Current Active Cost"
        color="blue"
      />

      <StatsCard
        title="Active Services"
        value={activeSubs.length.toString()}
        subtitle={`From ${totalCount} tracked plans`}
        color="emerald"
        icon={Sparkles}
      />

      <StatsCard
        title="Average Service Fee"
        value={`$${averagePrice.toFixed(2)}`}
        subtitle="Average cost per plan"
        color="indigo"
        icon={CalendarDays}
      />

      <StatsCard
        title="Next Renewal"
        value={nextRenewalText}
        subtitle={nextRenewalSubtitle}
        color={nearestDiffDays <= 3 ? "rose" : "amber"}
        icon={ShieldAlert}
      />
    </div>
  );
}

export default SummaryCards;
