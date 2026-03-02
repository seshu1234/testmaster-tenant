GET|HEAD / ........................................................................................................
GET|HEAD api/documentation ........................ l5-swagger.default.api › L5Swagger\Http › SwaggerController@api
GET|HEAD api/oauth2-callback l5-swagger.default.oauth2_callback › L5Swagger\Http › SwaggerController@oauth2Callback
GET|HEAD api/v1/admin/analytics/overview ............ admin.analytics.overview › Admin\AnalyticsController@overview
GET|HEAD api/v1/admin/audit ....................................... admin.audit.index › Admin\AuditController@index
GET|HEAD api/v1/admin/batches ................................... admin.batches.index › Admin\BatchController@index
POST api/v1/admin/batches ................................... admin.batches.store › Admin\BatchController@store
GET|HEAD api/v1/admin/batches/{batch} ............................. admin.batches.show › Admin\BatchController@show
PUT|PATCH api/v1/admin/batches/{batch} ......................... admin.batches.update › Admin\BatchController@update
DELETE api/v1/admin/batches/{batch} ....................... admin.batches.destroy › Admin\BatchController@destroy
POST api/v1/admin/batches/{id}/students ........ admin.batches.add-students › Admin\BatchController@addStudents
DELETE api/v1/admin/batches/{id}/students .. admin.batches.remove-students › Admin\BatchController@removeStudents
GET|HEAD api/v1/admin/branding ................................ admin.branding.show › Admin\BrandingController@show
PUT api/v1/admin/branding ............................ admin.branding.update › Admin\BrandingController@update
POST api/v1/admin/marketplace/purchase/{listing_id}/confirm admin.marketplace.purchase.confirm › Api\Marketpla…
POST api/v1/admin/marketplace/purchase/{listing_id}/intent admin.marketplace.purchase.intent › Api\Marketplace…
GET|HEAD api/v1/admin/students ............................... admin.students.index › Admin\StudentController@index
POST api/v1/admin/students ............................... admin.students.store › Admin\StudentController@store
POST api/v1/admin/students/bulk-import ........ admin.students.bulk-import › Admin\StudentController@bulkImport
GET|HEAD api/v1/admin/students/{student} ....................... admin.students.show › Admin\StudentController@show
PUT|PATCH api/v1/admin/students/{student} ................... admin.students.update › Admin\StudentController@update
DELETE api/v1/admin/students/{student} ................. admin.students.destroy › Admin\StudentController@destroy
GET|HEAD api/v1/admin/teachers ............................... admin.teachers.index › Admin\TeacherController@index
POST api/v1/admin/teachers ............................... admin.teachers.store › Admin\TeacherController@store
GET|HEAD api/v1/admin/teachers/{teacher} ....................... admin.teachers.show › Admin\TeacherController@show
PUT|PATCH api/v1/admin/teachers/{teacher} ................... admin.teachers.update › Admin\TeacherController@update
DELETE api/v1/admin/teachers/{teacher} ................. admin.teachers.destroy › Admin\TeacherController@destroy
GET|HEAD api/v1/admin/webhooks ................................. admin.webhooks.index › Api\WebhookController@index
POST api/v1/admin/webhooks ................................. admin.webhooks.store › Api\WebhookController@store
GET|HEAD api/v1/admin/webhooks/{webhook} ......................... admin.webhooks.show › Api\WebhookController@show
PUT|PATCH api/v1/admin/webhooks/{webhook} ..................... admin.webhooks.update › Api\WebhookController@update
DELETE api/v1/admin/webhooks/{webhook} ................... admin.webhooks.destroy › Api\WebhookController@destroy
GET|HEAD api/v1/files/{path} ......................................................................................
GET|HEAD api/v1/health ..................................................................................... health
POST api/v1/login .................................................................. Auth\LoginController@login
POST api/v1/logout ................................................................ Auth\LoginController@logout
POST api/v1/marketplace/publish/{test} .... marketplace.publish › Api\Marketplace\MarketplaceController@publish
POST api/v1/marketplace/purchase/{listing} marketplace.purchase › Api\Marketplace\MarketplaceController@purcha…
GET|HEAD api/v1/parent/wards ...................................... parent.wards › Api\ParentPortalController@wards
GET|HEAD api/v1/parent/wards/{studentId}/overview . parent.wards.overview › Api\ParentPortalController@wardOverview
POST api/v1/register ......................................................... Auth\RegisterController@register
POST api/v1/student/ai/generate-report student.ai.generate-report › Student\AiInsightsController@generateReport
GET|HEAD api/v1/student/ai/insights ...................... student.ai.insights › Student\AiInsightsController@index
GET|HEAD api/v1/student/ai/recommendations student.ai.recommendations › Student\AiInsightsController@recommendatio…
POST api/v1/student/attempts/{attemptId}/answers student.attempts.answers › Student\TestTakingController@saveA…
POST api/v1/student/attempts/{attemptId}/flag/{questionId} student.attempts.flag › Student\TestTakingControlle…
GET|HEAD api/v1/student/attempts/{attemptId}/result ....... student.attempts.result › Student\ResultController@show
GET|HEAD api/v1/student/attempts/{attemptId}/result/pdf student.attempts.result.pdf › Student\ResultController@dow…
POST api/v1/student/attempts/{attemptId}/submit . student.attempts.submit › Student\TestTakingController@submit
GET|HEAD api/v1/student/dashboard ........................... student.dashboard › Student\DashboardController@index
POST api/v1/student/offline-sync .................... student.offline-sync › Student\OfflineSyncController@sync
GET|HEAD api/v1/student/performance/predictions student.performance.predictions › Api\V1\Student\PerformanceContro…
POST api/v1/student/performance/rescue-test/{attempt} student.performance.rescue-test › Api\V1\Student\Perform…
GET|HEAD api/v1/student/performance/subjects student.performance.subjects › Student\PerformanceController@subjects
GET|HEAD api/v1/student/tests .................................. student.tests.index › Student\TestController@index
GET|HEAD api/v1/student/tests/completed ................ student.tests.completed › Student\TestController@completed
GET|HEAD api/v1/student/tests/upcoming ................... student.tests.upcoming › Student\TestController@upcoming
GET|HEAD api/v1/student/tests/{id} ............................... student.tests.show › Student\TestController@show
GET|HEAD api/v1/student/tests/{id}/leaderboard ... student.tests.leaderboard › Student\ResultController@leaderboard
GET|HEAD api/v1/student/tests/{id}/questions ..... student.tests.questions › Student\TestTakingController@questions
POST api/v1/student/tests/{id}/start ................. student.tests.start › Student\TestTakingController@start
GET|HEAD api/v1/super-admin/dashboard ......................... super-admin. › SuperAdmin\DashboardController@index
POST api/v1/super-admin/login .............................. super-admin. › Auth\SuperAdminAuthController@login
GET|HEAD api/v1/super-admin/plans ....................... super-admin.plans.index › SuperAdmin\PlanController@index
POST api/v1/super-admin/plans ....................... super-admin.plans.store › SuperAdmin\PlanController@store
GET|HEAD api/v1/super-admin/plans/{plan} .................. super-admin.plans.show › SuperAdmin\PlanController@show
PUT|PATCH api/v1/super-admin/plans/{plan} .............. super-admin.plans.update › SuperAdmin\PlanController@update
DELETE api/v1/super-admin/plans/{plan} ............ super-admin.plans.destroy › SuperAdmin\PlanController@destroy
GET|HEAD api/v1/super-admin/support/tickets super-admin.support.tickets.index › Api\V1\SuperAdmin\SupportTicketCon…
GET|HEAD api/v1/super-admin/support/tickets/{id} super-admin.support.tickets.show › Api\V1\SuperAdmin\SupportTicke…
PUT api/v1/super-admin/support/tickets/{id} super-admin.support.tickets.update › Api\V1\SuperAdmin\SupportTic…
POST api/v1/super-admin/support/tickets/{id}/reply super-admin.support.tickets.reply › Api\V1\SuperAdmin\Suppo…
GET|HEAD api/v1/super-admin/tenants ................. super-admin.tenants.index › SuperAdmin\TenantController@index
POST api/v1/super-admin/tenants ................. super-admin.tenants.store › SuperAdmin\TenantController@store
GET|HEAD api/v1/super-admin/tenants/{tenant} .......... super-admin.tenants.show › SuperAdmin\TenantController@show
PUT|PATCH api/v1/super-admin/tenants/{tenant} ...... super-admin.tenants.update › SuperAdmin\TenantController@update
DELETE api/v1/super-admin/tenants/{tenant} .... super-admin.tenants.destroy › SuperAdmin\TenantController@destroy
POST api/v1/teacher/ai/batch/generate-explanations teacher.ai.batch.generate-explanations › Teacher\AiControll…
POST api/v1/teacher/ai/batch/suggest-difficulties teacher.ai.batch.suggest-difficulties › Teacher\AiController…
POST api/v1/teacher/ai/enhance-question/{questionId} teacher.ai.enhance-question › Teacher\AiController@enhanc…
POST api/v1/teacher/ai/generate-explanation/{questionId} teacher.ai.generate-explanation › Teacher\AiControlle…
POST api/v1/teacher/ai/generate-questions teacher.ai.generate-questions › Teacher\AiController@generateQuestio…
POST api/v1/teacher/ai/suggest-difficulty/{questionId} teacher.ai.suggest-difficulty › Teacher\AiController@su…
GET|HEAD api/v1/teacher/ai/usage .................................... teacher.ai.usage › Teacher\AiController@usage
GET|HEAD api/v1/teacher/dashboard ........................... teacher.dashboard › Teacher\DashboardController@index
GET|HEAD api/v1/teacher/questions ...................... teacher.questions.index › Teacher\QuestionController@index
POST api/v1/teacher/questions ...................... teacher.questions.store › Teacher\QuestionController@store
POST api/v1/teacher/questions/bulk-import teacher.questions.bulk-import › Teacher\QuestionController@bulkImport
POST api/v1/teacher/questions/{id}/duplicate teacher.questions.duplicate › Teacher\QuestionController@duplicate
GET|HEAD api/v1/teacher/questions/{question} ............. teacher.questions.show › Teacher\QuestionController@show
PUT|PATCH api/v1/teacher/questions/{question} ......... teacher.questions.update › Teacher\QuestionController@update
DELETE api/v1/teacher/questions/{question} ....... teacher.questions.destroy › Teacher\QuestionController@destroy
GET|HEAD api/v1/teacher/tests .................................. teacher.tests.index › Teacher\TestController@index
POST api/v1/teacher/tests .................................. teacher.tests.store › Teacher\TestController@store
GET|HEAD api/v1/teacher/tests/{id}/analytics .. teacher.tests.analytics › Teacher\AnalyticsController@testAnalytics
GET|HEAD api/v1/teacher/tests/{id}/live .................. teacher.tests.live › Teacher\LiveMonitorController@index
GET|HEAD api/v1/teacher/tests/{id}/live/students teacher.tests.live.students › Teacher\LiveMonitorController@stude…
GET|HEAD api/v1/teacher/tests/{id}/preview ................. teacher.tests.preview › Teacher\TestController@preview
POST api/v1/teacher/tests/{id}/publish ................. teacher.tests.publish › Teacher\TestController@publish
POST api/v1/teacher/tests/{id}/release-results teacher.tests.release-results › Teacher\ResultController@releas…
GET|HEAD api/v1/teacher/tests/{id}/results ................. teacher.tests.results › Teacher\ResultController@index
POST api/v1/teacher/tests/{id}/schedule .............. teacher.tests.schedule › Teacher\TestController@schedule
POST api/v1/teacher/tests/{testId}/questions teacher.tests.questions.store › Teacher\TestQuestionController@st…
DELETE api/v1/teacher/tests/{testId}/questions/{id} teacher.tests.questions.destroy › Teacher\TestQuestionContro…
POST api/v1/teacher/tests/{testId}/sections teacher.tests.sections.store › Teacher\TestSectionController@store
PUT api/v1/teacher/tests/{testId}/sections/{id} teacher.tests.sections.update › Teacher\TestSectionController…
DELETE api/v1/teacher/tests/{testId}/sections/{id} teacher.tests.sections.destroy › Teacher\TestSectionControlle…
GET|HEAD api/v1/teacher/tests/{test} ............................. teacher.tests.show › Teacher\TestController@show
PUT|PATCH api/v1/teacher/tests/{test} ......................... teacher.tests.update › Teacher\TestController@update
DELETE api/v1/teacher/tests/{test} ....................... teacher.tests.destroy › Teacher\TestController@destroy
POST api/v1/tenant/login ...................................................... Auth\TenantAuthController@login
POST api/v1/tenant/register ........................................ Auth\TenantRegistrationController@register
GET|HEAD api/v1/test ..............................................................................................
POST api/v1/upload ................................................................ FileUploadController@upload
DELETE api/v1/upload ................................................................ FileUploadController@DELETE
GET|HEAD api/v1/uploads ................................................................. FileUploadController@list
GET|HEAD api/v1/uploads/{id} ............................................................ FileUploadController@show
GET|HEAD docs ................................... l5-swagger.default.docs › L5Swagger\Http › SwaggerController@docs
GET|HEAD docs/asset/{asset} .............. l5-swagger.default.asset › L5Swagger\Http › SwaggerAssetController@index
GET|HEAD horizon/api/batches ............... horizon.jobs-batches.index › Laravel\Horizon › BatchesController@index
POST horizon/api/batches/retry/{id} .... horizon.jobs-batches.retry › Laravel\Horizon › BatchesController@retry
GET|HEAD horizon/api/batches/{id} ............ horizon.jobs-batches.show › Laravel\Horizon › BatchesController@show
GET|HEAD horizon/api/jobs/completed horizon.completed-jobs.index › Laravel\Horizon › CompletedJobsController@index
GET|HEAD horizon/api/jobs/failed ......... horizon.failed-jobs.index › Laravel\Horizon › FailedJobsController@index
GET|HEAD horizon/api/jobs/failed/{id} ...... horizon.failed-jobs.show › Laravel\Horizon › FailedJobsController@show
GET|HEAD horizon/api/jobs/pending ...... horizon.pending-jobs.index › Laravel\Horizon › PendingJobsController@index
POST horizon/api/jobs/retry/{id} ............ horizon.retry-jobs.show › Laravel\Horizon › RetryController@store
GET|HEAD horizon/api/jobs/silenced ... horizon.silenced-jobs.index › Laravel\Horizon › SilencedJobsController@index
GET|HEAD horizon/api/jobs/{id} .......................... horizon.jobs.show › Laravel\Horizon › JobsController@show
GET|HEAD horizon/api/masters ........... horizon.masters.index › Laravel\Horizon › MasterSupervisorController@index
GET|HEAD horizon/api/metrics/jobs ....... horizon.jobs-metrics.index › Laravel\Horizon › JobMetricsController@index
GET|HEAD horizon/api/metrics/jobs/{id} .... horizon.jobs-metrics.show › Laravel\Horizon › JobMetricsController@show
GET|HEAD horizon/api/metrics/queues . horizon.queues-metrics.index › Laravel\Horizon › QueueMetricsController@index
GET|HEAD horizon/api/metrics/queues/{id} horizon.queues-metrics.show › Laravel\Horizon › QueueMetricsController@sh…
GET|HEAD horizon/api/monitoring ........... horizon.monitoring.index › Laravel\Horizon › MonitoringController@index
POST horizon/api/monitoring ........... horizon.monitoring.store › Laravel\Horizon › MonitoringController@store
GET|HEAD horizon/api/monitoring/{tag} horizon.monitoring-tag.paginate › Laravel\Horizon › MonitoringController@pag…
DELETE horizon/api/monitoring/{tag} horizon.monitoring-tag.destroy › Laravel\Horizon › MonitoringController@dest…
GET|HEAD horizon/api/stats ................. horizon.stats.index › Laravel\Horizon › DashboardStatsController@index
GET|HEAD horizon/api/workload ................. horizon.workload.index › Laravel\Horizon › WorkloadController@index
GET|HEAD horizon/{view?} ................................... horizon.index › Laravel\Horizon › HomeController@index
POST resend/webhook ......................... resend.webhook › Resend\Laravel › WebhookController@handleWebhook
GET|HEAD sanctum/csrf-cookie .................... sanctum.csrf-cookie › Laravel\Sanctum › CsrfCookieController@show
GET|HEAD storage/{path} ............................................................................. storage.local
POST telescope/telescope-api/batches ......................... Laravel\Telescope › QueueBatchesController@index
GET|HEAD telescope/telescope-api/batches/{telescopeEntryId} ....... Laravel\Telescope › QueueBatchesController@show
POST telescope/telescope-api/cache .................................. Laravel\Telescope › CacheController@index
GET|HEAD telescope/telescope-api/cache/{telescopeEntryId} ................ Laravel\Telescope › CacheController@show
POST telescope/telescope-api/client-requests ................ Laravel\Telescope › ClientRequestController@index
GET|HEAD telescope/telescope-api/client-requests/{telescopeEntryId} Laravel\Telescope › ClientRequestController@sh…
POST telescope/telescope-api/commands ............................ Laravel\Telescope › CommandsController@index
GET|HEAD telescope/telescope-api/commands/{telescopeEntryId} .......... Laravel\Telescope › CommandsController@show
POST telescope/telescope-api/dumps ................................... Laravel\Telescope › DumpController@index
DELETE telescope/telescope-api/entries ............................ Laravel\Telescope › EntriesController@destroy
POST telescope/telescope-api/events ................................ Laravel\Telescope › EventsController@index
GET|HEAD telescope/telescope-api/events/{telescopeEntryId} .............. Laravel\Telescope › EventsController@show
POST telescope/telescope-api/exceptions ......................... Laravel\Telescope › ExceptionController@index
GET|HEAD telescope/telescope-api/exceptions/{telescopeEntryId} ....... Laravel\Telescope › ExceptionController@show
PUT telescope/telescope-api/exceptions/{telescopeEntryId} ..... Laravel\Telescope › ExceptionController@update
POST telescope/telescope-api/gates .................................. Laravel\Telescope › GatesController@index
GET|HEAD telescope/telescope-api/gates/{telescopeEntryId} ................ Laravel\Telescope › GatesController@show
POST telescope/telescope-api/jobs ................................... Laravel\Telescope › QueueController@index
GET|HEAD telescope/telescope-api/jobs/{telescopeEntryId} ................. Laravel\Telescope › QueueController@show
POST telescope/telescope-api/logs ..................................... Laravel\Telescope › LogController@index
GET|HEAD telescope/telescope-api/logs/{telescopeEntryId} ................... Laravel\Telescope › LogController@show
POST telescope/telescope-api/mail .................................... Laravel\Telescope › MailController@index
GET|HEAD telescope/telescope-api/mail/{telescopeEntryId} .................. Laravel\Telescope › MailController@show
GET|HEAD telescope/telescope-api/mail/{telescopeEntryId}/download ...... Laravel\Telescope › MailEmlController@show
GET|HEAD telescope/telescope-api/mail/{telescopeEntryId}/preview ...... Laravel\Telescope › MailHtmlController@show
POST telescope/telescope-api/models ................................ Laravel\Telescope › ModelsController@index
GET|HEAD telescope/telescope-api/models/{telescopeEntryId} .............. Laravel\Telescope › ModelsController@show
GET|HEAD telescope/telescope-api/monitored-tags .................. Laravel\Telescope › MonitoredTagController@index
POST telescope/telescope-api/monitored-tags .................. Laravel\Telescope › MonitoredTagController@store
POST telescope/telescope-api/monitored-tags/DELETE ......... Laravel\Telescope › MonitoredTagController@destroy
POST telescope/telescope-api/notifications .................. Laravel\Telescope › NotificationsController@index
GET|HEAD telescope/telescope-api/notifications/{telescopeEntryId} Laravel\Telescope › NotificationsController@show
POST telescope/telescope-api/queries .............................. Laravel\Telescope › QueriesController@index
GET|HEAD telescope/telescope-api/queries/{telescopeEntryId} ............ Laravel\Telescope › QueriesController@show
POST telescope/telescope-api/redis .................................. Laravel\Telescope › RedisController@index
GET|HEAD telescope/telescope-api/redis/{telescopeEntryId} ................ Laravel\Telescope › RedisController@show
POST telescope/telescope-api/requests ............................ Laravel\Telescope › RequestsController@index
GET|HEAD telescope/telescope-api/requests/{telescopeEntryId} .......... Laravel\Telescope › RequestsController@show
POST telescope/telescope-api/schedule ............................ Laravel\Telescope › ScheduleController@index
GET|HEAD telescope/telescope-api/schedule/{telescopeEntryId} .......... Laravel\Telescope › ScheduleController@show
POST telescope/telescope-api/toggle-recording .................. Laravel\Telescope › RecordingController@toggle
POST telescope/telescope-api/views .................................. Laravel\Telescope › ViewsController@index
GET|HEAD telescope/telescope-api/views/{telescopeEntryId} ................ Laravel\Telescope › ViewsController@show
GET|HEAD telescope/{view?} ................................... telescope › Laravel\Telescope › HomeController@index
GET|HEAD tenancy/assets/{path?} .............. stancl.tenancy.asset › Stancl\Tenancy › TenantAssetsController@asset
GET|HEAD up .......................................................................................................
