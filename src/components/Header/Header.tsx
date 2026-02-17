function Header({ title }: { title: string }) {
  return (
    <header className="border-b-2 rounded-2xl border-b-blue-100">
      <div className="p-7 text-4xl font-bold">{title}</div>
    </header>
  );
}

export default Header;
