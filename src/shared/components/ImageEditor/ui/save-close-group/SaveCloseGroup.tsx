import { Check, Loader, X } from "../../assets/icons";
import { Button } from "../../ui/button/Button";
import rootStyles from "../../index.module.css";
import styles from "./save-close-group.module.css";

type SaveCloseGroupProps = {
  onSave: () => void;
  onClose: () => void;
  saving?: boolean;
  disabled?: boolean;
};

export const SaveCloseGroup = ({
  onSave,
  onClose,
  saving = false,
  disabled = false,
}: SaveCloseGroupProps) => {
  return (
    <div className={styles.scGroup}>
      <Button
        variant="outline"
        className={`${styles.scGroupSave} ${rootStyles.textGreen}`}
        disabled={disabled || saving}
        onClick={onSave}
      >
        {saving ? <Loader /> : <Check />}
      </Button>
      <Button
        variant="outline"
        className={`${styles.scGroupClose} ${rootStyles.textRed}`}
        disabled={saving}
        onClick={onClose}
      >
        <X />
      </Button>
    </div>
  );
};
