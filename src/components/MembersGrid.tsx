import ProfileCard from "./ui/profile-card";
import { DEFAULT_MEMBER_AVATAR } from "../data/community_members_data";

export default function MembersGrid({ members }: { members: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((m) => (
        <ProfileCard
          key={m.id}
          name={m.name}
          role={m.role}
          email={m.email}
          avatarSrc={m.photo || DEFAULT_MEMBER_AVATAR}
          className="w-full"
        />
      ))}
    </div>
  );
}
