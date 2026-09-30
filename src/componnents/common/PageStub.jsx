export default function PageStub({ title, description }) {
  return (
    <div className="neu-raised neu-shape-card mx-auto mt-6 max-w-lg p-6 text-center">
      <h2 className="text-base font-semibold text-neutral-700 dark:text-neutral-200">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      )}
    </div>
  );
}
