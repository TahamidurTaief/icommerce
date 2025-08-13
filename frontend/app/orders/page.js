
import React, { Suspense } from "react";
import OrderPageSkeleton from "../Components/Orders/OrderPageSkeleton";
import OrderListDisplay from "../Components/Orders/OrderListDisplay";


// Client-side data fetching will be handled in OrderListDisplay

export default function OrdersPage() {
	return (
		<Suspense fallback={<OrderPageSkeleton />}>
			<OrderListDisplay />
		</Suspense>
	);
}
