"use client";
import Image from "next/image";
import React, { useState } from "react";
import StepperLogin from "./StepperLogin";

export default function SignInForm() {
  return (
    <div className="flex flex-col flex-1 items-center lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8 text-center">
            <Image
              width={200}
              height={200}
              src="/images/logo/br-logo.jpg"
              alt="User"
              className="mx-auto mb-8"
            />
          </div>
          <StepperLogin />
        </div>
      </div>
    </div>
  );
}

