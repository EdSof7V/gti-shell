import SignInForm from "@/components/features/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "GTI Login Page | GTI Dashboard",
  description: "GTI Login Page",
};

export default function SignIn() {
  return <SignInForm />;
}
