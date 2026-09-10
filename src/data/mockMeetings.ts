import { Meeting, CalendarEvent, ShareClip } from '../types';

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'cal-1',
    title: 'Distributed Architecture & Q4 Scalability Review',
    date: 'Today',
    timeRange: '10:00 AM - 11:00 AM',
    platform: 'zoom',
    meetingLink: 'https://zoom.us/j/98234190823',
    attendeesCount: 8,
    attendeeNames: ['Sarah Chen', 'Alex Rivera', 'Dev Patel', 'Priya Sharma', 'Marcus Vance', 'Elena Rostova', 'James Thorne', 'Chloe Bennett'],
    autoRecord: true,
    isHost: true,
  },
  {
    id: 'cal-2',
    title: 'Enterprise Discovery: Acme Global Expansion',
    date: 'Today',
    timeRange: '1:30 PM - 2:00 PM',
    platform: 'meet',
    meetingLink: 'https://meet.google.com/abc-wxyz-qrs',
    attendeesCount: 3,
    attendeeNames: ['Dan Miller', 'Rachel Adams', 'Tom Wu'],
    autoRecord: true,
    isHost: false,
  },
  {
    id: 'cal-3',
    title: 'Sprint 42 Demo & Customer Feedback Loop',
    date: 'Tomorrow',
    timeRange: '11:00 AM - 11:45 AM',
    platform: 'teams',
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/19%3a...',
    attendeesCount: 6,
    attendeeNames: ['Sarah Chen', 'Priya Sharma', 'Liam O\'Connor', 'Zoe Martinez', 'Kai Tanaka', 'Dev Patel'],
    autoRecord: true,
    isHost: true,
  },
  {
    id: 'cal-4',
    title: 'Bi-weekly 1:1 — Dev Patel & Sarah Chen',
    date: 'Tomorrow',
    timeRange: '3:00 PM - 3:30 PM',
    platform: 'zoom',
    meetingLink: 'https://zoom.us/j/71239082341',
    attendeesCount: 2,
    attendeeNames: ['Sarah Chen', 'Dev Patel'],
    autoRecord: true,
    isHost: true,
  }
];

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'meet-8person-arch',
    title: 'Distributed Architecture & Q4 Scalability Review',
    date: 'Sep 10, 2026 • 10:00 AM',
    duration: 3480, // 58 minutes
    platform: 'zoom',
    category: 'architecture',
    tags: ['Architecture', 'Scaling', 'Postgres', 'Kafka', 'Q4-Planning'],
    attendees: [
      { id: 'u-1', name: 'Sarah Chen', role: 'Staff Systems Architect (Host)', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', email: 'sarah.chen@acme.corp', isHost: true },
      { id: 'u-2', name: 'Alex Rivera', role: 'Lead Backend Engineer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', email: 'alex.rivera@acme.corp' },
      { id: 'u-3', name: 'Dev Patel', role: 'DevOps & Cloud Infrastructure', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', email: 'dev.patel@acme.corp' },
      { id: 'u-4', name: 'Priya Sharma', role: 'Product Lead', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', email: 'priya.sharma@acme.corp' },
      { id: 'u-5', name: 'Marcus Vance', role: 'Security & Compliance Officer', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', email: 'marcus.vance@acme.corp' },
      { id: 'u-6', name: 'Elena Rostova', role: 'Frontend Core Architect', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', email: 'elena.rostova@acme.corp' },
      { id: 'u-7', name: 'James Thorne', role: 'Data Platform Lead', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', email: 'james.thorne@acme.corp' },
      { id: 'u-8', name: 'Chloe Bennett', role: 'Reliability & QA Lead', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', email: 'chloe.bennett@acme.corp' }
    ],
    highlights: [
      {
        id: 'hl-1',
        timestamp: 165, // 02:45
        speakerName: 'Sarah Chen',
        category: 'decision',
        note: 'Monolith isolation boundary: Billing and User Auth will be extracted first in Phase 1.',
        color: 'emerald',
        quote: 'We need to stop debating a rewrite. We will carve out billing and auth services first while leaving the core product engine in place.'
      },
      {
        id: 'hl-2',
        timestamp: 745, // 12:25
        speakerName: 'Marcus Vance',
        category: 'concern',
        note: 'Compliance Flag: EU GDPR data residency mandates tokenized user profiles before cross-region replication.',
        color: 'rose',
        quote: 'If we replicate Kafka topics to Frankfurt without field-level PII encryption, our audit fails in November.'
      },
      {
        id: 'hl-3',
        timestamp: 1420, // 23:40
        speakerName: 'Dev Patel',
        category: 'action_item',
        note: 'Dev to spin up isolated benchmark cluster in us-east4 to test 12,000 rps with PgBouncer connection pooling.',
        color: 'blue',
        quote: 'I can have the terraform module ready by Thursday so we can run synthetic stress tests.'
      },
      {
        id: 'hl-4',
        timestamp: 2180, // 36:20
        speakerName: 'Elena Rostova',
        category: 'key_question',
        note: 'Frontend websocket sync: How do we prevent race conditions during distributed network partitions?',
        color: 'amber',
        quote: 'If the connection drops for 5 seconds during an active collaborative edit, what is the single source of truth?'
      },
      {
        id: 'hl-5',
        timestamp: 2950, // 49:10
        speakerName: 'Priya Sharma',
        category: 'positive_feedback',
        note: 'Customer impact: 99.95% SLA achievement will unlock the $400k enterprise tier with Stripe & Brex.',
        color: 'purple',
        quote: 'This technical work directly satisfies the enterprise security questionnaire that was blocking the Brex rollout.'
      },
      {
        id: 'hl-6',
        timestamp: 3310, // 55:10
        speakerName: 'Sarah Chen',
        category: 'decision',
        note: 'Final sign-off: Unanimous consensus to proceed with the ADR-042 proposal.',
        color: 'emerald',
        quote: 'All eight leads are in agreement. We publish the ADR today and kick off sprint allocation on Monday.'
      }
    ],
    actionItems: [
      { id: 'ai-1', title: 'Publish finalized ADR-042 Architecture Decision Record to engineering wiki', assigneeName: 'Sarah Chen', completed: true, timestamp: 180, dueDate: 'Today, 5 PM' },
      { id: 'ai-2', title: 'Spin up us-east4 test cluster with PgBouncer connection pooling benchmarks', assigneeName: 'Dev Patel', completed: false, timestamp: 1435, dueDate: 'Thursday' },
      { id: 'ai-3', title: 'Draft field-level PII encryption schema for Kafka European event topics', assigneeName: 'Marcus Vance', completed: false, timestamp: 760, dueDate: 'Friday' },
      { id: 'ai-4', title: 'Prototype optimistic CRDT resolution in client state store for offline reconnections', assigneeName: 'Elena Rostova', completed: false, timestamp: 2210, dueDate: 'Next Tuesday' },
      { id: 'ai-5', title: 'Update Enterprise Sales Deck with verified 99.95% availability SLA parameters', assigneeName: 'Priya Sharma', completed: false, timestamp: 2980, dueDate: 'Next Wednesday' },
      { id: 'ai-6', title: 'Implement automated chaos testing scenarios in synthetic staging pipeline', assigneeName: 'Chloe Bennett', completed: false, timestamp: 3120, dueDate: 'Oct 1' }
    ],
    summary: {
      template: 'architecture',
      overview: 'The 8 core engineering and product leads convened for a comprehensive 58-minute architectural review to finalize the Q4 scalability strategy. The group officially ratified ADR-042, committing to a phased microservice isolation starting with Billing and Auth, Postgres tenant-level partitioning, and field-level encryption for EU cross-region replication.',
      sections: [
        {
          title: '1. Service Decomposition & Boundary Strategy',
          points: [
            'Avoided a risky ground-up rewrite in favor of the Strangler Fig pattern.',
            'Billing & Subscription service and Authentication/Identity service will be decoupled first.',
            'Core product domain logic stays in the unified service through Q1 2027 to protect feature velocity.'
          ]
        },
        {
          title: '2. Database Scaling & Multi-Region Constraints',
          points: [
            'Postgres connections saturated under peak traffic (85% pool utilization at 15k concurrent users).',
            'Agreed to introduce PgBouncer pooling and read replica offloading for analytical telemetry.',
            'Dev Patel will benchmark 12k rps synthetic load in us-east4 before production deployment.'
          ]
        },
        {
          title: '3. Security, Compliance & PII Handling',
          points: [
            'Marcus Vance flagged European GDPR data residency compliance for the Frankfurt disaster recovery cluster.',
            'All Kafka event topics crossing geopolitical borders must enforce field-level envelope encryption.',
            'No raw customer email addresses or payment metadata allowed in centralized trace logs.'
          ]
        },
        {
          title: '4. Real-time Frontend Synchronization & UX Resilience',
          points: [
            'Elena Rostova demonstrated that websocket drops cause brief state divergence in collaborative mode.',
            'Team will implement lightweight CRDT (Conflict-free Replicated Data Type) reconciliation on the client.',
            'User experience must gracefully display optimistic updates with reconnect indicators.'
          ]
        },
        {
          title: '5. Business & Product Milestone Alignment',
          points: [
            'Priya Sharma confirmed that hitting the 99.95% uptime SLA unlocks pending enterprise deals ($400k+ ARR).',
            'Final ADR-042 documentation will be shared with the executive staff following this call.'
          ]
        }
      ],
      keyDecisions: [
        'Approved ADR-042: Strangler Fig migration for Billing and Auth services.',
        'Adopted PgBouncer connection pooling and tenant-based sharding model.',
        'Mandated field-level encryption on all cross-region Kafka event streams.',
        'Committed to 99.95% customer-facing uptime SLA starting Nov 1.'
      ],
      sentiment: 'positive'
    },
    transcript: [
      { id: 't-1', speakerId: 'u-1', speakerName: 'Sarah Chen', startTime: 0, endTime: 18, text: 'Good morning everyone. We have all eight leads here today, which is great because we need clear alignment on Q4 architecture. Alex, Dev, Priya, Marcus, Elena, James, and Chloe. Let us jump right in.' },
      { id: 't-2', speakerId: 'u-2', speakerName: 'Alex Rivera', startTime: 19, endTime: 48, text: 'Thanks Sarah. Looking at our telemetry from last week\'s traffic spike, our API gateway held up nicely, but our primary Postgres database hit 87% CPU and connection timeouts cascaded into the notification workers.' },
      { id: 't-3', speakerId: 'u-3', speakerName: 'Dev Patel', startTime: 49, endTime: 82, text: 'Yeah, to Alex\'s point, we had 950 open connections against our primary RDS instance. Most of those were idle waiting on third-party webhook acknowledgments. It is clearly time to separate connection pools and introduce dedicated PgBouncer proxies.' },
      { id: 't-4', speakerId: 'u-4', speakerName: 'Priya Sharma', startTime: 83, endTime: 115, text: 'From the product side, we have three Tier-1 enterprise prospects entering final technical review next month. If we have another 4-minute outage like we did in August, it jeopardizes the entire Q4 revenue target. We need a guaranteed 99.95% SLA.' },
      { id: 't-5', speakerId: 'u-1', speakerName: 'Sarah Chen', startTime: 116, endTime: 175, text: 'Agreed Priya. That is why we are proposing ADR-042 today. We need to stop debating a full ground-up rewrite. Instead, we will carve out billing and auth services first while leaving the core product engine in place using the Strangler Fig pattern.' },
      { id: 't-6', speakerId: 'u-5', speakerName: 'Marcus Vance', startTime: 176, endTime: 220, text: 'I want to raise an urgent compliance flag regarding the multi-region setup. If we replicate Kafka topics to our Frankfurt disaster recovery cluster without field-level PII encryption, our SOC2 and GDPR audit fails in November. Any user profile data must be tokenized before transit.' },
      { id: 't-7', speakerId: 'u-7', speakerName: 'James Thorne', startTime: 221, endTime: 265, text: 'From the data platform perspective, we can enforce schema validation at the producer level using Avro and Schema Registry. That way, any event containing PII without an encryption key tag gets rejected immediately before entering the pipeline.' },
      { id: 't-8', speakerId: 'u-8', speakerName: 'Chloe Bennett', startTime: 266, endTime: 310, text: 'From QA and reliability, how do we plan to test this before rollout? I want to make sure we run automated chaos testing in our staging environment — simulating network partitions between us-east and eu-west.' },
      { id: 't-9', speakerId: 'u-6', speakerName: 'Elena Rostova', startTime: 311, endTime: 360, text: 'And on the web frontend, we have to consider what the user sees when a partition happens. If an architect is editing a collaborative meeting summary in real-time and their websocket disconnects for 5 seconds, what is the single source of truth when they reconnect?' },
      { id: 't-10', speakerId: 'u-2', speakerName: 'Alex Rivera', startTime: 361, endTime: 415, text: 'We should use state vector versioning or a lightweight CRDT. When Elena\'s client reconnects, it sends the highest known vector timestamp, and our server replays only missed delta mutations.' },
      { id: 't-11', speakerId: 'u-3', speakerName: 'Dev Patel', startTime: 416, endTime: 470, text: 'I can have an isolated us-east4 test cluster ready by Thursday with synthetic load generation up to 12,000 requests per second. That will give Chloe\'s chaos tests realistic load numbers.' },
      { id: 't-12', speakerId: 'u-4', speakerName: 'Priya Sharma', startTime: 471, endTime: 510, text: 'That timeline works wonderfully. If we validate the benchmark by Friday, I can confidently answer the security questionnaires from Brex and Stripe early next week.' },
      { id: 't-13', speakerId: 'u-5', speakerName: 'Marcus Vance', startTime: 511, endTime: 550, text: 'I will draft the encryption specification and key rotation guide by tomorrow afternoon so Alex and James can integrate it directly into the producer configs.' },
      { id: 't-14', speakerId: 'u-1', speakerName: 'Sarah Chen', startTime: 551, endTime: 600, text: 'Fantastic. So we are in unanimous agreement on ADR-042: phased service extraction starting with billing and auth, PgBouncer proxy layer, Kafka field-level encryption, and client CRDT reconciliation. I will publish the finalized record today.' }
    ]
  },
  {
    id: 'meet-sales-acme',
    title: 'Enterprise Discovery: Acme Global Expansion',
    date: 'Sep 9, 2026 • 2:00 PM',
    duration: 1920, // 32 minutes
    platform: 'meet',
    category: 'sales',
    tags: ['Sales', 'Enterprise', 'BANT', 'CRM', 'Discovery'],
    attendees: [
      { id: 's-1', name: 'Dan Miller', role: 'Account Executive (Host)', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', email: 'dan@fathom.video', isHost: true },
      { id: 's-2', name: 'Rachel Adams', role: 'VP Global Sales at Acme Corp', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', email: 'rachel.adams@acme.corp' },
      { id: 's-3', name: 'Tom Wu', role: 'Director of Business Technology', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80', email: 'tom.wu@acme.corp' }
    ],
    highlights: [
      {
        id: 'shl-1',
        timestamp: 210, // 03:30
        speakerName: 'Rachel Adams',
        category: 'action_item',
        note: 'Budget confirmation: $120,000 ARR pre-approved in FY27 IT budget for automated call intelligence.',
        color: 'emerald',
        quote: 'We have budgeted 120k for this specific initiative across our 250 quota-carrying account executives.'
      },
      {
        id: 'shl-2',
        timestamp: 680, // 11:20
        speakerName: 'Tom Wu',
        category: 'concern',
        note: 'Technical Requirement: Real-time bi-directional Salesforce & HubSpot opportunity stage syncing.',
        color: 'rose',
        quote: 'If our reps have to manually copy action items into Salesforce fields, adoption will crater.'
      },
      {
        id: 'shl-3',
        timestamp: 1240, // 20:40
        speakerName: 'Dan Miller',
        category: 'decision',
        note: 'Agreed Next Step: 14-day 30-seat enterprise pilot starting Oct 1st.',
        color: 'emerald',
        quote: 'Let us launch a pilot with Rachel\'s North America team of 30 reps, configured with your custom Salesforce fields.'
      }
    ],
    actionItems: [
      { id: 'sai-1', title: 'Send Master Services Agreement (MSA) and Enterprise Pilot Agreement', assigneeName: 'Dan Miller', completed: true, timestamp: 1250, dueDate: 'Tomorrow' },
      { id: 'sai-2', title: 'Schedule IT security questionnaire review with Tom Wu\'s infosec team', assigneeName: 'Dan Miller', completed: false, timestamp: 1400, dueDate: 'Friday' },
      { id: 'sai-3', title: 'Provide sample list of 30 North America reps for pilot provisioning', assigneeName: 'Rachel Adams', completed: false, timestamp: 1510, dueDate: 'Next Monday' }
    ],
    summary: {
      template: 'sales',
      overview: 'Discovery call with Rachel Adams (VP Sales) and Tom Wu (Dir IT) at Acme Corp. Strong qualification criteria met. Prospect has 250 sales reps losing ~4 hours per week on manual CRM entry. High urgency to deploy automated notetaker before Q4 kickoff.',
      sections: [
        {
          title: 'BANT Qualification Matrix',
          points: [
            'Budget: $120,000 ARR pre-approved in current fiscal plan.',
            'Authority: Rachel has executive discretion; Tom holds infosec & SSO sign-off.',
            'Need: Automated meeting notes, CRM auto-enrichment, and rep coaching clip library.',
            'Timeline: 30-seat pilot launch October 1st; full rollout expected December 1st.'
          ]
        },
        {
          title: 'Key Pain Points',
          points: [
            'Sales reps spend an average of 42 minutes per day summarizing Zoom calls.',
            'Disparate note-taking quality leads to inaccurate deal forecasting in Salesforce.',
            'New SDR onboarding takes 90 days due to lack of real call snippet libraries.'
          ]
        },
        {
          title: 'Security & Integration Requirements',
          points: [
            'Okta SAML 2.0 Single Sign-On required for all team members.',
            'Custom Salesforce mapping: auto-fill Next Steps, Deal Risk, Competitor Mentions.',
            'Retention policy: recordings must automatically delete after 365 days.'
          ]
        }
      ],
      keyDecisions: [
        'Confirmed 14-day 30-seat pilot beginning Oct 1.',
        'Dan will coordinate custom Salesforce sandbox integration directly with Tom Wu.'
      ],
      sentiment: 'positive'
    },
    transcript: [
      { id: 'st-1', speakerId: 's-1', speakerName: 'Dan Miller', startTime: 0, endTime: 15, text: 'Hello Rachel, hello Tom. Thanks for joining today. Excited to walk you through how Fathom can automate note-taking and CRM sync for Acme.' },
      { id: 'st-2', speakerId: 's-2', speakerName: 'Rachel Adams', startTime: 16, endTime: 55, text: 'Thanks Dan. Right now our 250 reps are drowning in administrative overhead. They take calls on Zoom, take sloppy notes in random docs, and half of our pipeline updates in Salesforce are two weeks out of date.' },
      { id: 'st-3', speakerId: 's-3', speakerName: 'Tom Wu', startTime: 56, endTime: 95, text: 'From the IT side, my biggest concern is security and integration. We cannot have bots joining customer confidential discussions unless Okta SSO is enforced and transcripts are encrypted in transit and at rest.' },
      { id: 'st-4', speakerId: 's-1', speakerName: 'Dan Miller', startTime: 96, endTime: 140, text: 'That is exactly how Fathom is designed, Tom. We are SOC2 Type II certified, integrate natively with Okta SAML, and sync structured notes directly into custom Salesforce opportunity fields with zero rep effort.' },
      { id: 'st-5', speakerId: 's-2', speakerName: 'Rachel Adams', startTime: 141, endTime: 185, text: 'We have budgeted 120k for this specific initiative. If we can run a 30-seat pilot with my top reps starting October 1st and prove adoption, we will greenlight the full contract for all 250 seats.' }
    ]
  },
  {
    id: 'meet-1on1-dev',
    title: 'Bi-weekly 1:1 — Dev Patel & Sarah Chen',
    date: 'Sep 8, 2026 • 3:00 PM',
    duration: 1320, // 22 minutes
    platform: 'zoom',
    category: '1on1',
    tags: ['1on1', 'Career', 'Mentorship', 'Feedback'],
    attendees: [
      { id: 'u-1', name: 'Sarah Chen', role: 'Staff Systems Architect (Manager)', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', email: 'sarah.chen@acme.corp', isHost: true },
      { id: 'u-3', name: 'Dev Patel', role: 'DevOps & Cloud Infrastructure', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', email: 'dev.patel@acme.corp' }
    ],
    highlights: [
      {
        id: 'ohl-1',
        timestamp: 180, // 03:00
        speakerName: 'Sarah Chen',
        category: 'positive_feedback',
        note: 'Praise: Dev’s zero-downtime database migration last month was praised by VP of Eng.',
        color: 'purple',
        quote: 'Your meticulous rollback plan gave everyone confidence during the Friday night window.'
      },
      {
        id: 'ohl-2',
        timestamp: 620, // 10:20
        speakerName: 'Dev Patel',
        category: 'action_item',
        note: 'Career milestone: Dev to take lead on presenting ADR-042 to the broader engineering org.',
        color: 'emerald',
        quote: 'I would love the opportunity to present the infrastructure slides at the All-Hands.'
      }
    ],
    actionItems: [
      { id: 'oai-1', title: 'Submit company expense request for Advanced Kubernetes Networking conference pass', assigneeName: 'Dev Patel', completed: true, timestamp: 480, dueDate: 'Completed' },
      { id: 'oai-2', title: 'Prepare 10-minute slide deck summarizing PgBouncer benchmarks for All-Hands', assigneeName: 'Dev Patel', completed: false, timestamp: 650, dueDate: 'Next Thursday' }
    ],
    summary: {
      template: '1on1',
      overview: 'Productive bi-weekly check-in between Sarah Chen and Dev Patel. Reviewed recent infrastructure wins, discussed career progression toward Senior DevOps Lead, and confirmed Dev’s upcoming presentation at engineering all-hands.',
      sections: [
        {
          title: 'Recent Accomplishments & Wins',
          points: [
            'Zero-downtime execution of the database schema migration without customer impact.',
            'Reduced cloud compute staging costs by 18% through automated idle pod pruning.'
          ]
        },
        {
          title: 'Career Growth & Opportunities',
          points: [
            'Dev is targeting promotion to Senior DevOps Lead in the upcoming review cycle.',
            'Sarah encouraged public technical leadership by having Dev present the new architecture.'
          ]
        },
        {
          title: 'Current Blockers & Support Needed',
          points: [
            'Dev requested additional cloud budget authorization for synthetic chaos tests.',
            'Sarah approved up to $1,500 in dedicated test compute.'
          ]
        }
      ],
      keyDecisions: [
        'Approved conference sponsorship for Kubernetes Summit.',
        'Dev confirmed as lead speaker for architecture review in upcoming all-hands.'
      ],
      sentiment: 'positive'
    },
    transcript: [
      { id: 'ot-1', speakerId: 'u-1', speakerName: 'Sarah Chen', startTime: 0, endTime: 12, text: 'Hey Dev, great to catch up. How are you feeling after that massive database migration last week?' },
      { id: 'ot-2', speakerId: 'u-3', speakerName: 'Dev Patel', startTime: 13, endTime: 35, text: 'Honestly feeling great! The automated health checks caught two deadlocks early, and our rollback scripts were never needed.' },
      { id: 'ot-3', speakerId: 'u-1', speakerName: 'Sarah Chen', startTime: 36, endTime: 60, text: 'The VP of Engineering specifically commended your preparation. You handled that like a senior lead.' }
    ]
  },
  {
    id: 'meet-quick-test',
    title: 'Quick Audio Test & Bot Calibration',
    date: 'Sep 10, 2026 • 9:30 AM',
    duration: 134, // 2 min 14 sec
    platform: 'meet',
    category: 'test',
    tags: ['Self-Test', 'Calibration', 'Audio-Check'],
    attendees: [
      { id: 'u-self', name: 'You (Current User)', role: 'Host', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', email: 'user@fathom.video', isHost: true }
    ],
    highlights: [
      {
        id: 'qhl-1',
        timestamp: 35,
        speakerName: 'You (Current User)',
        category: 'action_item',
        note: 'Calibration check: Microphone sensitivity and acoustic echo cancellation confirmed crisp.',
        color: 'emerald',
        quote: 'Audio levels are testing at -12dB with clear frequency response.'
      },
      {
        id: 'qhl-2',
        timestamp: 85,
        speakerName: 'You (Current User)',
        category: 'decision',
        note: 'Playback verification: Real-time waveform and transcript synchronization operational.',
        color: 'blue',
        quote: 'Live transcription latency is sub-500 milliseconds.'
      }
    ],
    actionItems: [
      { id: 'qai-1', title: 'Verify Fathom audio filter suppresses typing sounds during screen shares', assigneeName: 'You', completed: true, timestamp: 40, dueDate: 'Done' },
      { id: 'qai-2', title: 'Test 1-click highlight bookmark shortcut during live meeting recording', assigneeName: 'You', completed: true, timestamp: 90, dueDate: 'Done' }
    ],
    summary: {
      template: 'executive',
      overview: 'Solo 2-minute calibration session verifying audio capture levels, transcription fidelity, and bookmark highlight response.',
      sections: [
        {
          title: 'Audio & Bot Diagnostics',
          points: [
            'Microphone gain calibrated with clean voice detection.',
            'Speech-to-text latency clocked at under 450ms.',
            'Highlight bookmarking buttons registered accurately on the timeline.'
          ]
        }
      ],
      keyDecisions: [
        'Bot calibration confirmed ready for multi-party production calls.'
      ],
      sentiment: 'positive'
    },
    transcript: [
      { id: 'qt-1', speakerId: 'u-self', speakerName: 'You (Current User)', startTime: 0, endTime: 25, text: 'Testing microphone input for the Fathom AI notetaker. One, two, three. Testing background noise suppression and speaker identification.' },
      { id: 'qt-2', speakerId: 'u-self', speakerName: 'You (Current User)', startTime: 26, endTime: 60, text: 'Audio levels are testing at -12dB with clear frequency response. Let me bookmark an action item right here to ensure the highlight lands properly on the video timeline.' },
      { id: 'qt-3', speakerId: 'u-self', speakerName: 'You (Current User)', startTime: 61, endTime: 95, text: 'Live transcription latency is sub-500 milliseconds. When this recording completes, the AI summary should generate within 3 seconds.' },
      { id: 'qt-4', speakerId: 'u-self', speakerName: 'You (Current User)', startTime: 96, endTime: 134, text: 'Wrapping up this quick 2-minute calibration call. Everything looks completely ready for the 8-person architecture review.' }
    ]
  }
];

export const INITIAL_CLIPS: ShareClip[] = [
  {
    id: 'clip-strangler-fig',
    meetingId: 'meet-8person-arch',
    meetingTitle: 'Distributed Architecture & Q4 Scalability Review',
    title: 'Sarah explaining the Strangler Fig migration strategy',
    startTime: 116,
    endTime: 175,
    createdDate: 'Sep 10, 2026',
    authorName: 'Sarah Chen',
    shareUrl: 'https://fathom.video/share/clip-strangler-fig-042',
    isPublic: true
  },
  {
    id: 'clip-kafka-pii',
    meetingId: 'meet-8person-arch',
    meetingTitle: 'Distributed Architecture & Q4 Scalability Review',
    title: 'Marcus Vance on EU GDPR Kafka field-level encryption mandate',
    startTime: 176,
    endTime: 220,
    createdDate: 'Sep 10, 2026',
    authorName: 'Marcus Vance',
    shareUrl: 'https://fathom.video/share/clip-kafka-pii-audit',
    isPublic: true
  }
];
