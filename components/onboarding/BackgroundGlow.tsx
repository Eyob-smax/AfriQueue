export function BackgroundGlow() {
  return (
    <div className="fixed inset-0 opacity-5 pointer-events-none z-0">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary blur-3xl -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-primary blur-3xl -ml-64 -mb-64" />
    </div>
  );
}
