import TaxSettings from './TaxSettings';

export default function TaxCompliancePage() {
  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Compliance Fiscal
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Configure tributação, alíquotas e certificação digital.
          </p>
        </div>
      </header>

      <TaxSettings />
    </div>
  );
}