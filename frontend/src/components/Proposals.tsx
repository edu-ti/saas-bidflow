import React, { useState } from 'react';
import PreProposalsList from './proposals/PreProposalsList';
import ProposalsTable from './proposals/ProposalsTable';
import CreateProposalForm from './proposals/CreateProposalForm';

export default function Proposals() {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      
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
