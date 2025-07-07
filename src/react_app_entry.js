import { renderMoodleReactApp } from './main';

// Questo è ciò che Moodle cerca quando chiami:
// $page->requires->js_call_amd('block_configuratore/react_app_bundle_entry', 'renderMoodleReactApp', [...])
export { renderMoodleReactApp };