import { CartItem } from "../../../lib/types/search";
import ArchiveTopNav from "../../screens/homePage/ArchiveTopNav";

interface OtherNavbarProps {
  cartItems: CartItem[];
  onAdd: (item: CartItem) => void;
  onRemove: (item: CartItem) => void;
  onDelete: (item: CartItem) => void;
  onDeleteAll: () => void;
  setSignupOpen: (isOpen: boolean) => void;
  setLoginOpen: (isOpen: boolean) => void;
  handleLogoutClick: (e: React.MouseEvent<HTMLElement>) => void;
  anchorEl: HTMLElement | null;
  handleCloseLogout: () => void;
  handleLogoutRequest: () => void;
}

/** Same Stitch navbar as archive home — fixed glass bar + tokens */
export default function OtherNavbar(props: OtherNavbarProps) {
  return <ArchiveTopNav {...props} />;
}
