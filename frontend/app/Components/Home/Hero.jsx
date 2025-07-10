"use client";

import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Autoplay } from "swiper/modules";

import banner1 from "@/public/img/banner/banner-1.jpg";
import banner2 from "@/public/img/banner/banner-2.jpg";
import banner3 from "@/public/img/banner/banner-3.jpg";

const Hero = () => {
  return (
    <div className="">
      <div className="w-full h-[30vh] md:h-[50vh] static mx-auto z-0 object-cover">
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          loop
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          className=""
        >
          {[banner1, banner2, banner3].map((banner, index) => (
            <SwiperSlide key={index}>
              <div className="w-full h-[30vh] md:h-[50vh] relative overflow-hidden object-cover">
                <Image
                  src={banner}
                  alt={`Banner ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <style jsx global>{`
          .swiper-pagination-bullet {
            background-color: orange;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Hero;
