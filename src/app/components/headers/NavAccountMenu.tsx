import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Member } from "../../../lib/types/member";
import { getImageUrl } from "../../../lib/config";
import { MemberType } from "../../../lib/enums/member.enum";
import "../../../css/nav-account-menu.css";

function roleLabel(memberType: MemberType | string | undefined): string {
  if (!memberType) return "Member";
  if (memberType === MemberType.USER) return "Member";
  return String(memberType).replace(/_/g, " ");
}

interface NavAccountMenuProps {
  authMember: Member | null;
  onLoginClick: () => void;
  onSignOut: () => void | Promise<void>;
}

export default function NavAccountMenu({ authMember, onLoginClick, onSignOut }: NavAccountMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (el && !el.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDocMouseDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  if (!authMember) {
    return (
      <button
        type="button"
        className="nav-account-menu__signin text-[#b9c3ff] transition-transform hover:scale-105 active:scale-95"
        onClick={onLoginClick}
        aria-label="Sign in"
      >
        <span className="material-symbols-outlined">person</span>
      </button>
    );
  }

  const avatarSrc = authMember.memberImage
    ? getImageUrl(authMember.memberImage)
    : "/icons/default-user.svg";

  return (
    <div className="nav-account-menu" ref={wrapRef}>
      <button
        type="button"
        className="nav-account-menu__trigger transition-transform hover:scale-105 active:scale-95"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Account menu"
      >
        <img
          className="h-9 w-9 rounded-full border border-[#b9c3ff]/40 object-cover"
          src={avatarSrc}
          alt={authMember.memberNick || "User"}
        />
      </button>
      {open ? (
        <div className="nav-account-menu__panel" role="menu">
          <div className="nav-account-menu__user">
            <img src={avatarSrc} alt="" className="nav-account-menu__user-avatar" width={36} height={36} />
            <div className="nav-account-menu__user-text">
              <span className="nav-account-menu__user-name">{authMember.memberNick || "Member"}</span>
              <span className="nav-account-menu__user-role">{roleLabel(authMember.memberType)}</span>
            </div>
          </div>
          <Link to="/member-page" className="nav-account-menu__item" role="menuitem" onClick={close}>
            <span aria-hidden>👤</span>
            My Profile
          </Link>
          <Link to="/orders" className="nav-account-menu__item" role="menuitem" onClick={close}>
            <span aria-hidden>📦</span>
            My Orders
          </Link>
          <div className="nav-account-menu__divider" role="presentation" />
          <button
            type="button"
            className="nav-account-menu__item nav-account-menu__item--button"
            role="menuitem"
            onClick={() => {
              close();
              void onSignOut();
            }}
          >
            <span aria-hidden>🚪</span>
            Sign Out
          </button>
        </div>
      ) : null}
    </div>
  );
}
