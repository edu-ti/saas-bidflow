import React from 'react';
import PreProposalsList from './proposals/PreProposalsList';
import ProposalsTable from './proposals/ProposalsTable';
import CreateProposalForm from './proposals/CreateProposalForm';

export default function Proposals() {
  const [isCreating, setIsCreating] = React.useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      {!isCreating ? (
        <>
          <PreProposalsList />
          <ProposalsTable onCreateClick={() => setIsCreating(true)} />
        </>
      ) : (
        <CreateProposalForm onClose={() => setIsCreating(false)} />
      )}
    </div>
  );
}
