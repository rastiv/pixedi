import styles from "./ImageList.module.css";

const imagesData = [
  { id: "1", original: "/bird.jpg" },
  { id: "2", original: "/butterfly.jpg" },
  { id: "4", original: "/leafs.jpg" },
  { id: "5", original: "/parrot.jpg" },
  { id: "6", original: "/sunset.png" },
  { id: "3", original: "/flowers.png" },
];

type ImageListProps = {
  onImageClick: (src: string) => void;
};

export const ImageList = ({ onImageClick }: ImageListProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageClick((e.target as HTMLImageElement).src);
  };

  return (
    <div className={styles.grid}>
      {imagesData.map((image) => (
        <div key={image.id} className={styles.gridItem}>
          <img
            src={image.original}
            alt={image.id}
            className={styles.gridItemImg}
            onClick={handleClick}
          />
        </div>
      ))}
    </div>
  );
};
