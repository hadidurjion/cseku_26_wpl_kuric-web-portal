export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter flex flex-col flex-1">{children}</div>;
}