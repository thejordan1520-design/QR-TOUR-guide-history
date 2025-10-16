import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFeedbackReplies } from '../hooks/useFeedbackReplies';
import FeedbackReplyToast from './FeedbackReplyToast';

const FeedbackReplyManager: React.FC = () => {
  const { user } = useAuth();
  const { showToast, currentReply, hideToast, viewDetails } = useFeedbackReplies(user?.id);

  if (!user || !showToast || !currentReply) {
    return null;
  }

  return (
    <FeedbackReplyToast
      feedbackId={currentReply.id}
      adminResponse={currentReply.admin_response}
      respondedAt={currentReply.responded_at}
      destinationTitle={currentReply.destination_title}
      onClose={hideToast}
      onViewDetails={viewDetails}
    />
  );
};

export default FeedbackReplyManager;
