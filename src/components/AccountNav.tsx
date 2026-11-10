import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/session";

export async function AccountNav() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <Link href="/login" className="site-nav__link">
        Login
      </Link>
    );
  }

  return (
    <>
      <Link href="/profile" className="site-nav__link">
        Profile
      </Link>
      {user.role === "instructor" ? (
        <Link href="/classrooms" className="site-nav__link">
          Classrooms
        </Link>
      ) : null}
      {user.admin ? (
        <Link href="/admin" className="site-nav__link">
          Admin
        </Link>
      ) : null}
      <form action={logout}>
        <button type="submit" className="site-nav__link site-nav__button">
          Log out
        </button>
      </form>
    </>
  );
}
