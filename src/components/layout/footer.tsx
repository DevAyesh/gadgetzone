import Link from "next/link";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaCcAmex, FaCcApplePay, FaCcDinersClub, FaCcDiscover, FaCcJcb, FaCcMastercard, FaCcVisa, FaCcStripe, FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Send } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-white pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Column 1: Subscribe */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold tracking-tight">
              Gadget Mart
            </h3>
            <p className="text-sm text-gray-300 font-medium mt-4">
              Get 10% off your first order
            </p>
            <div className="relative mt-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-transparent border border-white/40 rounded py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:border-white transition-colors placeholder:text-gray-500"
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Column 2: Support */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Support</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="leading-relaxed">No. 45, Galle Road, Colombo 03,<br/>Western Province, Sri Lanka.</li>
              <li>gadgetmart@gmail.com</li>
              <li>+94 77 123 4567</li>
            </ul>
          </div>

          {/* Column 3: Account */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Account</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link href="/account" className="hover:text-white transition-colors">My Account</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Login / Register</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">Cart</Link></li>
              <li><Link href="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
              <li><Link href="/shop" className="hover:text-white transition-colors">Shop</Link></li>
            </ul>
          </div>

          {/* Column 4: Quick Link */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Link</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms Of Use</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Column 5: Download App */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Download App</h4>
            <p className="text-xs text-gray-400 mb-2">Save $3 with App New User Only</p>
            <div className="flex gap-2 mb-6">
              <div className="w-[80px] h-[80px] bg-white p-1 rounded-sm flex items-center justify-center">
                {/* QR Code Placeholder */}
                <div className="w-full h-full bg-black flex items-center justify-center text-[10px] text-center">QR</div>
              </div>
              <div className="flex flex-col gap-2 justify-center">
                <div className="w-28 h-8 border border-white/20 rounded-md flex items-center justify-center text-xs hover:bg-white/10 cursor-pointer transition-colors">
                  Google Play
                </div>
                <div className="w-28 h-8 border border-white/20 rounded-md flex items-center justify-center text-xs hover:bg-white/10 cursor-pointer transition-colors">
                  App Store
                </div>
              </div>
            </div>
            <div className="flex gap-6">
              <Link href="#" className="text-white hover:text-gray-300 transition-colors">
                <FaFacebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-white hover:text-gray-300 transition-colors">
                <FaTwitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-white hover:text-gray-300 transition-colors">
                <FaInstagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-white hover:text-gray-300 transition-colors">
                <FaLinkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-16 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <p className="text-sm text-gray-500">
            &copy; Copyright Gadget Mart {new Date().getFullYear()}. All right reserved
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* Amex */}
            <div className="bg-[#007bc1] text-white w-10 h-7 rounded-[4px] flex flex-col items-center justify-center font-bold text-[8px] leading-[8px] shadow-sm tracking-widest pt-0.5">
              <span>AM</span>
              <span>EX</span>
            </div>
            {/* Apple Pay */}
            <div className="bg-white text-black w-10 h-7 rounded-[4px] flex items-center justify-center font-bold text-[10px] gap-0.5 shadow-sm">
              <FaApple className="text-[12px] mb-0.5" />Pay
            </div>
            {/* Diners Club */}
            <div className="bg-white w-10 h-7 rounded-[4px] flex items-center justify-center shadow-sm relative overflow-hidden">
              <div className="w-5 h-5 rounded-full border-[3px] border-[#004b8d] flex items-center justify-center">
                 <div className="w-2.5 h-2.5 bg-[#004b8d] rounded-r-full -ml-1"></div>
              </div>
            </div>
            {/* Discover */}
            <div className="bg-white w-10 h-7 rounded-[4px] flex items-center justify-center font-black text-[6.5px] shadow-sm">
              <span className="text-black">DISC</span>
              <div className="w-2 h-2 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 mx-[0.5px]"></div>
              <span className="text-black">VER</span>
            </div>
            {/* Google Pay */}
            <div className="bg-white text-gray-600 w-10 h-7 rounded-[4px] flex items-center justify-center font-medium text-[10px] shadow-sm tracking-tight">
              <FcGoogle className="text-[12px] mr-0.5" />Pay
            </div>
            {/* JCB */}
            <div className="bg-white w-10 h-7 rounded-[4px] flex items-center justify-center shadow-sm">
              <div className="flex gap-[1px]">
                <div className="w-2.5 h-3.5 bg-gradient-to-b from-[#007940] to-green-700 rounded-[2px] text-white text-[6px] font-bold flex items-center justify-center">J</div>
                <div className="w-2.5 h-3.5 bg-gradient-to-b from-[#eb001b] to-red-700 rounded-[2px] text-white text-[6px] font-bold flex items-center justify-center">C</div>
                <div className="w-2.5 h-3.5 bg-gradient-to-b from-[#007bc1] to-blue-700 rounded-[2px] text-white text-[6px] font-bold flex items-center justify-center">B</div>
              </div>
            </div>
            {/* Mastercard */}
            <div className="bg-[#1c1c1c] w-10 h-7 rounded-[4px] flex items-center justify-center shadow-sm">
              <div className="flex items-center">
                <div className="w-[14px] h-[14px] bg-[#eb001b] rounded-full opacity-90 -mr-1.5 mix-blend-screen"></div>
                <div className="w-[14px] h-[14px] bg-[#f79e1b] rounded-full opacity-90 mix-blend-screen"></div>
              </div>
            </div>
            {/* UnionPay */}
            <div className="bg-gradient-to-r from-[#d90023] via-[#003875] to-[#007a87] w-10 h-7 rounded-[4px] flex flex-col items-center justify-center shadow-sm">
               <span className="text-white text-[5px] italic font-bold tracking-wider leading-[6px]">UnionPay</span>
               <span className="text-white text-[4px] font-bold mt-0.5">银联</span>
            </div>
            {/* Visa */}
            <div className="bg-[#1434cb] w-10 h-7 rounded-[4px] flex items-center justify-center text-white font-bold text-[11px] italic shadow-sm">
              VISA
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
