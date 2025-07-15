// app/cart/page.jsx

import CartView from "../Components/Cart/CartView";

/**
 * This is the main page for the shopping cart.
 * As a Server Component, it remains lightweight.
 * It renders the <CartView /> client component, which contains all the
 * interactive logic. Next.js automatically wraps <CartView /> in a
 * Suspense boundary, displaying the sibling `loading.jsx` file
 * while the client component and its dependencies are loaded.
 */
const page = () => {
  return (
    <>
      <div className="pb-20 md:pb-5">
        <CartView />
      </div>
    </>
  );
};

export default page;
