// import { motion, type Variants } from "motion/react";
// import { Link } from "react-router";
// import type { Image } from "@/shared/types";

// type ImageCardProps = {
//   image: Image;
// };

// export const ImageCard = ({ image }: ImageCardProps) => {
//   const imageVariants: Variants = {
//     rest: { scale: 1, opacity: 0.5 },
//     hover: {
//       scale: 1.1,
//       opacity: 1,
//     },
//   };

//   return (
//     <Link to={`/images/${image.id}`}>
//       <motion.div
//         className={`
//           relative
//           w-full aspect-4/3
//           overflow-hidden cursor-pointer box-border
//           border border-neutral-400
//         `}
//         whileHover="hover"
//         initial="rest"
//         animate="rest"
//       >
//         <motion.div
//           className="absolute inset-0 opacity-50"
//           variants={imageVariants}
//           transition={{ duration: 0.3, ease: "easeIn" }}
//           style={{
//             backgroundImage: `url(${image.thumbnail})`,
//             backgroundSize: "cover",
//             backgroundPosition: "center",
//           }}
//         />
//       </motion.div>
//     </Link>
//   );
// };

type ImageCardProps = {
  image: {
    id: string;
  };
};

export const ImageCard = ({ image }: ImageCardProps) => {
  return <div>{image.id}</div>;
};
