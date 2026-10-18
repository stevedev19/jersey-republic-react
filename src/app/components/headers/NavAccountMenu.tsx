import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { Member } from "../../../lib/types/member";
import { getImageUrl } from "../../../lib/config";
import { MemberType } from "../../../lib/enums/member.enum";
import "../../../css/nav-account-menu.css";

function roleLabel(memberType: MemberType | string | undefined, t: TFunction): string {
  if (!memberType) return t("account.member");
  if (memberType === MemberType.USER) return t("account.member");
  return String(memberType).replace(/_/g, " ");
}

interface NavAccountMenuProps {
  authMember: Member | null;
  onLoginClick: () => void;
  onSignOut: () => void | Promise<void>;
}

export default function NavAccountMenu({ authMember, onLoginClick, onSignOut }: NavAccountMenuProps) {
  const { t } = useTranslation();
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
        className="nav-account-menu__signin text-[color:var(--ink)] transition-colors hover:text-[color:var(--navy)]"
        onClick={onLoginClick}
        aria-label={t("account.signIn")}
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
        className="nav-account-menu__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={t("account.menuLabel")}
      >
        <img
          className="h-9 w-9 rounded-full border border-[color:var(--sand)] object-cover"
          src={avatarSrc}
          alt={authMember.memberNick || t("account.user")}
        />
      </button>
      {open ? (
        <div className="nav-account-menu__panel" role="menu">
          <div className="nav-account-menu__user">
            <img src={avatarSrc} alt="" className="nav-account-menu__user-avatar" width={36} height={36} />
            <div className="nav-account-menu__user-text">
              <span className="nav-account-menu__user-name">{authMember.memberNick || t("account.member")}</span>
              <span className="nav-account-menu__user-role">{roleLabel(authMember.memberType, t)}</span>
            </div>
          </div>
          <Link to="/member-page" className="nav-account-menu__item" role="menuitem" onClick={close}>
            {t("account.profile")}
          </Link>
          <Link to="/orders" className="nav-account-menu__item" role="menuitem" onClick={close}>
            {t("account.orders")}
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
            {t("account.signOut")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
