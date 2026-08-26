import { Check, Loader, X } from "../../assets/icons";
import { Button } from "../button/Button";
import styles from "./SaveCloseGroup.module.css";

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
    <div className={styles.group}>
      <Button
        variant="outline"
        className={styles.save}
        disabled={disabled || saving}
        onClick={onSave}
      >
        {saving ? <Loader /> : <Check />}
      </Button>
      <Button
        variant="outline"
        className={styles.close}
        disabled={saving}
        onClick={onClose}
      >
        <X />
      </Button>
    </div>
  );
};
