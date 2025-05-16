/* eslint-disable @next/next/no-img-element */
import { User } from "@/app/api/users/types";
import styles from "./UserAvatar.module.scss";

interface Props {
    user?: User;
}

export default function UserAvatar({ user }: Props) {
  return (
    <div className={styles.container}>
      {user?.image_url && (
        <img
          src={user?.image_url}
          alt="User selfie"
          width={42}
          height={42}
          className={styles.avatar}
        />
      )}
      <h2 className={styles.name}>{user?.nickname}</h2>
    </div>
  );
}
