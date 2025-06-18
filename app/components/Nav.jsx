import { cookies } from 'next/headers';

export default function Nav() {
  const session = cookies().get('session');

  return (
    <nav className="p-8">
      <ul className="flex items-left gap-[24px] w-full justify-center">
        <li><a href="/">Home</a></li>
        <li><a href="/admin">Admin</a></li>
        {session ? (
          <li>
            <a
              href="/logout"
              className="bg-blue-500 text-white rounded-md p-2"
            >
              Logout
            </a>
          </li>
        ) : (
          <li>
            <a href="/admin" className="bg-blue-500 text-white rounded-md p-2">Login</a>
          </li>
        )}
      </ul>
    </nav>
  );
}