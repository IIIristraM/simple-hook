import { Webhooks } from '@octokit/webhooks';

export type WebhookEvent =
    | Webhooks.WebhookPayloadWorkflowDispatch
    | Webhooks.WebhookPayloadWatch
    | Webhooks.WebhookPayloadTeamAdd
    | Webhooks.WebhookPayloadStar
    | Webhooks.WebhookPayloadStar
    | Webhooks.WebhookPayloadRepositoryImport
    | Webhooks.WebhookPayloadRepository
    | Webhooks.WebhookPayloadRepositoryDispatch
    | Webhooks.WebhookPayloadStatus
    | Webhooks.WebhookPayloadRelease
    | Webhooks.WebhookPayloadPush
    | Webhooks.WebhookPayloadPullRequestReviewComment
    | Webhooks.WebhookPayloadPullRequestReview
    | Webhooks.WebhookPayloadPullRequest
    | Webhooks.WebhookPayloadPublic
    | Webhooks.WebhookPayloadProject
    | Webhooks.WebhookPayloadProjectColumn
    | Webhooks.WebhookPayloadProjectCard
    | Webhooks.WebhookPayloadPing
    | Webhooks.WebhookPayloadPageBuild
    | Webhooks.WebhookPayloadPackage
    | Webhooks.WebhookPayloadMilestone
    | Webhooks.WebhookPayloadMeta
    | Webhooks.WebhookPayloadMember
    | Webhooks.WebhookPayloadLabel
    | Webhooks.WebhookPayloadIssues
    | Webhooks.WebhookPayloadCheckRun
    | Webhooks.WebhookPayloadCheckSuite
    | Webhooks.WebhookPayloadCommitComment
    | Webhooks.WebhookPayloadContentReference
    | Webhooks.WebhookPayloadCreate
    | Webhooks.WebhookPayloadDelete
    | Webhooks.WebhookPayloadDeployKey
    | Webhooks.WebhookPayloadDeployment
    | Webhooks.WebhookPayloadDeploymentStatus
    | Webhooks.WebhookPayloadFork
    | Webhooks.WebhookPayloadGollum
    | Webhooks.WebhookPayloadIssueComment;

export type WebhookPullRequestEvent =
    | Webhooks.WebhookPayloadPullRequestReviewComment
    | Webhooks.WebhookPayloadPullRequestReview
    | Webhooks.WebhookPayloadPullRequest;

export type WebhookJob = {
    id: string;
    events: Array<{
        id: string;
        actions?: string[];
    }>;
    command: string;
    env?: Record<string, string>;
};

export type WebhooksConfig = {
    jobs: WebhookJob[];
};
