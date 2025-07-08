import React from "react";
import Image from "next/image";

import men_fashion from "@/public/img/Home/Caregory/men-fashion.jpeg";

const Review = () => {
  return (
    <div className="container mx-auto pb-10 pt-5">
      <div className="flex bg-white dark:bg-[var(--color-second-bg)] p-4 rounded-xl shadow-md">
        <div className="flex flex-col justify-center gap-3 text-center mx-auto w-[90%] md:w-[80%] max-w-[700px] my-5">
          <div className="flex justify-center">
            <Image
              src={men_fashion}
              alt=""
              className="w-full max-w-20 max-h-20 rounded-full"
            ></Image>
          </div>
          <div className="text-[var(--color-text-primary)] dark:text-[var(--color-text-secondary)] mt-4">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sit sed
            incidunt maiores a et ipsam, accusamus iure optio aperiam quas fuga.
          </div>
          <div className="text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] font-semibold text-lg raleway md:text-xl xl:text-2xl">
            - Tahamidur Taief
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;
