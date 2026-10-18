import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { retrieveTopUsers } from "./selector";
import { getImageUrl } from "../../../lib/config";
import { Member } from "../../../lib/types/member";
import "../../../css/active-users-section.css";

const topUsersRetriever = createSelector(retrieveTopUsers, (topUsers) => ({ topUsers }));

function memberSinceLabel(createdAt: Date | string | undefined, t: TFunction): string {
  if (!createdAt) return t("home.activeUsers.memberSinceUnknown");
  const y = new Date(createdAt).getFullYear();
  if (Number.isNaN(y)) return t("home.activeUsers.memberSinceUnknown");
  return t("home.activeUsers.memberSince", { year: y });
}

function ActiveUserCard({ member }: { member: Member }) {
  const { t } = useTranslation();
  const imagePath = member.memberImage
    ? member.memberImage.startsWith("http")
      ? member.memberImage
      : getImageUrl(member.memberImage)
    : "/icons/default-user.svg";

  return (
    <article className="active-user-card group">
      <div className="active-user-card__media">
        <img src={imagePath} alt="" loading="lazy" decoding="async" />
        <div className="active-user-card__gradient" aria-hidden />
        <div className="active-user-card__info">
          <p className="active-user-card__name">{member.memberNick}</p>
          <p className="active-user-card__since">{memberSinceLabel(member.createdAt, t)}</p>
        </div>
      </div>
    </article>
  );
}

export default function ActiveUsers() {
  const { t } = useTranslation();
  const { topUsers } = useSelector(topUsersRetriever);
  const safeTopUsers = Array.isArray(topUsers) ? topUsers : [];

  const hasUsers = safeTopUsers.length !== 0;

  return (
    <section className="active-users-section" aria-labelledby="active-users-heading">
      <div className="active-users-section__inner">
        <div
          className={
            hasUsers
              ? "active-users-section__layout active-users-section__layout--split"
              : "active-users-section__layout"
          }
        >
          {hasUsers ? (
            <div className="active-users-section__grid">
              {safeTopUsers.map((member) => (
                <ActiveUserCard key={member._id} member={member} />
              ))}
            </div>
          ) : null}

          <header className="active-users-section__header">
            <h2 id="active-users-heading" className="active-users-section__title">
              <span className="active-users-section__title-line active-users-section__title-line--white">
                {t("home.activeUsers.titleLine1")}
              </span>
              <span className="active-users-section__title-line active-users-section__title-line--accent">
                {t("home.activeUsers.titleAccent")}
              </span>
            </h2>
            <p className="active-users-section__subtitle">{t("home.activeUsers.subtitle")}</p>
          </header>

          {!hasUsers ? (
            <p className="active-users-section__empty">{t("home.activeUsers.empty")}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
