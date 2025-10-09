// "use client";

// import { useState } from "react";
// import { X, ChevronDown, Upload } from "lucide-react";
// import { Button } from "@/components/ui/button";

// interface IndividualModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export default function IndividualModal({ isOpen, onClose }: IndividualModalProps) {
//   const [policyType, setPolicyType] = useState("Individual Policy");
//   const [assetType, setAssetType] = useState("Car/Motor");
//   const [assetValue, setAssetValue] = useState("$14,045.00");
//   const [duration, setDuration] = useState("min. 6 months");
//   const [description, setDescription] = useState("");

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 flex items-center justify-center z-50">
//       {/* Blurred backdrop */}
//       <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

//       {/* Modal content */}
//       <div className="relative bg-[#1E2722] p-6 w-full max-w-[700px] mx-4">
//         <div className="flex justify-end items-end mb-6">
        
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-white transition-colors"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         <div className="space-y-4">
//           {/* Policy Type */}
//           <div className="mb-4">
//             <label className="block text-xl font-medium text-gray-300 mb-2">
//               Select policy type
//             </label>
//             <div className="relative">
//               <select
//                 value={policyType}
//                 onChange={(e) => setPolicyType(e.target.value)}
//                 className="w-full border border-gray-600 rounded-md px-3 py-2 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#12D96A]"
//               >
//                 <option value="Individual Policy">Individual Policy</option>
//                 <option value="Group Policy">Group Policy</option>
               
//               </select>
//               <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
//             </div>
//           </div>

//           {/* Asset Type */}
//           <div className="mb-4">
//             <label className="block text-xl font-medium text-gray-300 mb-2">
//               Select asset type
//             </label>
//             <div className="relative">
//               <select
//                 value={assetType}
//                 onChange={(e) => setAssetType(e.target.value)}
//                 className="w-full border border-gray-600 rounded-md px-3 py-2 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#12D96A]"
//               >
//                 <option value="Car/Motor">Car/Motor</option>
//                 <option value="Property">Property</option>
//                 <option value="Equipment">Equipment</option>
//                 <option value="Other">Other</option>
//               </select>
//               <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
//             </div>
//           </div>

//           {/* Asset Value */}
//           <div className="mb-4">
//               <label className="block text-xl font-medium text-gray-300 mb-2">
//               Add asset value
//             </label>
//             <input
//               type="text"
//               value={assetValue}
//               onChange={(e) => setAssetValue(e.target.value)}
//               className="w-full border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#12D96A]"
//               placeholder="$0.00"
//             />
//           </div>

//           {/* Duration */}
//           <div className="mb-4">
//             <label className="block text-xl font-medium text-gray-300 mb-2">
//               Duration of Asset Holding
//             </label>
//             <div className="relative">
//               <select
//                 value={duration}
//                 onChange={(e) => setDuration(e.target.value)}
//                 className="w-full border border-gray-600 rounded-md px-3 py-2 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#12D96A]"
//               >
//                 <option value="min. 6 months">min. 6 months</option>
//                 <option value="1 year">1 year</option>
//                 <option value="2 years">2 years</option>
//                 <option value="3+ years">3+ years</option>
//               </select>
//               <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
//             </div>
//           </div>

//           {/* Asset Description */}
//           <div className="mb-4">
//             <label className="block text-xl font-medium text-gray-300 mb-2">
//               Asset Description
//             </label>
//             <textarea
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               placeholder="Type something"
//               rows={3}
//                 className="w-full border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#12D96A] resize-none mb-2"
//             />
//           </div>

//           {/* Upload Document */}
//           <div className="mb-4">
//             <label className="block text-xl font-medium text-gray-300 mb-2">
//               Upload Document
//             </label>
//               <div className="border-2 border-dashed border-gray-600 rounded-md p-8 text-center hover:border-[#12D96A] transition-colors cursor-pointer">
//               <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
//               <p className="text-gray-400 text-sm">Upload a document of ownership</p> 
              
//             </div>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex gap-3 mt-6">
//           <Button
//             onClick={onClose}
//             variant="outline"
//             className="flex-1 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
//           >
//             Cancel
//           </Button> 
//           <Button
//             onClick={() => {
//               // Handle continue logic here
//               console.log("Continue clicked");
//             }}
//             className="flex-1 bg-[#12D96A] hover:bg-[#0FC55E] text-black"
//           >
//             Continue
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
