import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { retrieveTopUsers } from "./selector";
import { getImageUrl } from "../../../lib/config";
import { Member } from "../../../lib/types/member";
import "../../../css/active-users-section.css";

const topUsersRetriever = createSelector(retrieveTopUsers, (topUsers) => ({ topUsers }));

/** Stable pseudo-metrics for cards (replace when API exposes orders/views). */
function statsForMember(member: Member): { orders: number; views: number } {
  let h = 0;
  for (let i = 0; i < member._id.length; i++) {
    h = (h << 5) - h + member._id.charCodeAt(i);
  }
  const u = Math.abs(h);
  const orders = 3 + (u % 38);
  const views = 180 + (u % 420) + member.memberPoints * 2;
  return { orders, views };
}

function memberSinceLabel(createdAt: Date | string | undefined): string {
  if (!createdAt) return "MEMBER SINCE —";
  const y = new Date(createdAt).getFullYear();
  if (Number.isNaN(y)) return "MEMBER SINCE —";
  return `MEMBER SINCE ${y}`;
}

function ActiveUserCard({ member }: { member: Member }) {
  const imagePath = member.memberImage
    ? member.memberImage.startsWith("http")
      ? member.memberImage
      : getImageUrl(member.memberImage)
    : "/icons/default-user.svg";
  const { orders, views } = statsForMember(member);

  return (
    <article className="active-user-card group">
      <div className="active-user-card__media">
        <img src={imagePath} alt="" loading="lazy" decoding="async" />
        <div className="active-user-card__gradient" aria-hidden />
        <div className="active-user-card__info">
          <p className="active-user-card__name">{member.memberNick}</p>
          <p className="active-user-card__since">{memberSinceLabel(member.createdAt)}</p>
          <div className="active-user-card__stats">
            <div className="active-user-card__stat">
              <span className="active-user-card__stat-num">{orders}</span>
              <span className="active-user-card__stat-label">orders</span>
            </div>
            <div className="active-user-card__stat">
              <span className="active-user-card__stat-num">{views.toLocaleString()}</span>
              <span className="active-user-card__stat-label">views</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ActiveUsers() {
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
                ACTIVE
              </span>
              <span className="active-users-section__title-line active-users-section__title-line--accent">
                USERS.
              </span>
            </h2>
            <p className="active-users-section__subtitle">The collectors behind the collection.</p>
          </header>

          {!hasUsers ? (
            <p className="active-users-section__empty">No active members to show yet.</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
