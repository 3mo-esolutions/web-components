import { story, meta } from '../../.storybook/story.js'
import { html, style } from '@a11d/lit'
import p from './package.json'
import './Symbol.js'
import { SymbolVariant, MaterialSymbol } from './index.js'

const icons = new Array<MaterialSymbol>(
	'10k', '10mp', '11mp', '123', '12mp', '13mp', '14mp', '15mp', '16mp', '17mp', '18_up_rating', '18mp', '19mp', '1k', '1k_plus', '20mp', '21mp', '22mp', '23mp', '24mp', '2k', '2k_plus', '2mp', '30fps', '30fps_select', '360', '3d_rotation', '3k', '3k_plus', '3mp', '3p', '4k', '4k_plus', '4mp', '5k', '5k_plus', '5mp', '60fps', '60fps_select', '6_ft_apart', '6k', '6k_plus', '6mp', '7k', '7k_plus', '7mp', '8k', '8k_plus', '8mp', '9k', '9k_plus', '9mp', 'abc', 'accessibility', 'accessibility_new', 'accessible', 'accessible_forward', 'account_balance', 'account_balance_wallet', 'account_box', 'account_circle', 'account_circle', 'account_tree', 'ad_units', 'add', 'add_a_photo', 'add_alert', 'add_box', 'add_business', 'add_call', 'add_card', 'add_chart', 'add_circle', 'add_comment', 'add_home', 'add_home_work', 'add_link', 'add_location', 'add_location_alt', 'add_photo_alternate', 'add_reaction', 'add_road', 'add_shopping_cart', 'add_task', 'add_to_photos', 'add_to_queue', 'adjust', 'ads_click', 'agender', 'agriculture', 'air', 'airline_stops', 'airlines', 'airplay', 'airport_shuttle', 'alarm', 'alarm_add', 'alarm_off', 'alarm_on', 'album', 'align_horizontal_center', 'align_horizontal_left', 'align_horizontal_right', 'align_vertical_bottom', 'align_vertical_center', 'align_vertical_top', 'all_inbox', 'all_inclusive', 'all_out', 'alt_route', 'alternate_email', 'amp_stories', 'analytics', 'anchor', 'animation', 'apartment', 'api', 'app_registration', 'app_shortcut', 'approval', 'approval_delegation', 'apps', 'apps_outage', 'architecture', 'archive', 'area_chart', 'arrow_back', 'arrow_back_ios', 'arrow_back_ios_new', 'arrow_circle_down', 'arrow_circle_left', 'arrow_circle_right', 'arrow_circle_up', 'arrow_downward', 'arrow_drop_down', 'arrow_drop_down_circle', 'arrow_drop_up', 'arrow_forward', 'arrow_forward_ios', 'arrow_left', 'arrow_outward', 'arrow_right', 'arrow_right_alt', 'arrow_upward', 'art_track', 'article', 'aspect_ratio', 'assignment', 'assignment_add', 'assignment_ind', 'assignment_late', 'assignment_return', 'assignment_returned', 'assignment_turned_in', 'assist_walker', 'assistant', 'assistant_direction', 'assistant_navigation', 'astrophotography_auto', 'astrophotography_off', 'atm', 'attach_email', 'attach_file', 'attach_money', 'attachment', 'attribution', 'audio_file', 'auto_awesome', 'auto_awesome_mosaic', 'auto_awesome_motion', 'auto_delete', 'auto_graph', 'auto_mode', 'auto_read_pause', 'auto_read_play', 'auto_stories', 'autofps_select', 'autopay', 'autorenew', 'av_timer', 'baby_changing_station', 'background_replace', 'backpack', 'backspace', 'backup', 'backup_table', 'badge', 'ballot', 'bar_chart', 'barcode', 'barcode_scanner', 'batch_prediction', 'bedtime', 'bedtime_off', 'beenhere', 'bike_scooter', 'biotech', 'blind', 'block', 'bloodtype', 'blur_circular', 'blur_linear', 'blur_medium', 'blur_off', 'blur_on', 'blur_short', 'bolt', 'book', 'bookmark', 'bookmark_add', 'bookmark_added', 'bookmark_remove', 'bookmarks', 'border_all', 'border_bottom', 'border_clear', 'border_color', 'border_horizontal', 'border_inner', 'border_left', 'border_outer', 'border_right', 'border_style', 'border_top', 'border_vertical', 'boy', 'branding_watermark', 'breaking_news_alt_1', 'breastfeeding', 'brightness_1', 'brightness_2', 'brightness_3', 'brightness_4', 'brightness_5', 'brightness_6', 'brightness_7', 'bring_your_own_ip', 'broadcast_on_home', 'broadcast_on_personal', 'broken_image', 'browse_activity', 'browse_gallery', 'brush', 'bubble_chart', 'bug_report', 'build', 'build_circle', 'burst_mode', 'bus_alert', 'business_center', 'business_chip', 'cached', 'cake', 'calculate', 'calendar_add_on', 'calendar_apps_script', 'calendar_month', 'calendar_today', 'calendar_view_day', 'calendar_view_month', 'calendar_view_week', 'call', 'call_end', 'call_made', 'call_merge', 'call_missed', 'call_missed_outgoing', 'call_received', 'call_split', 'call_to_action', 'camera', 'camera_enhance', 'camera_front', 'camera_rear', 'camera_roll', 'campaign', 'camping', 'cancel', 'cancel_presentation', 'cancel_schedule_send', 'candlestick_chart', 'car_crash', 'card_membership', 'card_travel', 'cases', 'castle', 'category', 'celebration', 'cell_tower', 'cell_wifi', 'center_focus_strong', 'center_focus_weak', 'change_circle', 'change_history', 'chat', 'chat_add_on', 'chat_apps_script', 'chat_bubble', 'check', 'check_box', 'check_box_outline_blank', 'check_circle', 'check_indeterminate_small', 'check_small', 'checklist', 'checklist_rtl', 'chevron_left', 'chevron_right', 'chrome_reader_mode', 'church', 'cinematic_blur', 'circle', 'circle_notifications', 'clarify', 'clean_hands', 'cleaning_services', 'clear', 'clear_all', 'clear_day', 'close', 'close_fullscreen', 'closed_caption', 'closed_caption_disabled', 'cloud', 'cloud_circle', 'cloud_done', 'cloud_download', 'cloud_off', 'cloud_queue', 'cloud_sync', 'cloud_upload', 'cloudy', 'cloudy_filled', 'co2', 'co_present', 'code', 'code_blocks', 'code_off', 'collections_bookmark', 'colorize', 'comment', 'comment_bank', 'comments_disabled', 'commit', 'communication', 'commute', 'compare', 'compare_arrows', 'compass_calibration', 'component_exchange', 'compost', 'compress', 'confirmation_number', 'connect_without_contact', 'connecting_airports', 'construction', 'contact_emergency', 'contact_mail', 'contact_page', 'contact_phone', 'contact_support', 'contactless', 'contactless_off', 'contacts', 'content_copy', 'content_cut', 'content_paste', 'content_paste_go', 'content_paste_off', 'content_paste_search', 'contrast', 'control_camera', 'control_point_duplicate', 'conversion_path', 'cookie', 'copy_all', 'copyright', 'coronavirus', 'corporate_fare', 'create_new_folder', 'credit_card', 'credit_card_off', 'credit_score', 'crisis_alert', 'crop', 'crop_16_9', 'crop_3_2', 'crop_5_4', 'crop_7_5', 'crop_free', 'crop_landscape', 'crop_portrait', 'crop_rotate', 'crop_square', 'cruelty_free', 'css', 'currency_bitcoin', 'currency_exchange', 'currency_franc', 'currency_lira', 'currency_pound', 'currency_ruble', 'currency_rupee', 'currency_yen', 'currency_yuan', 'cut', 'cycle',
	'cyclone', 'dangerous', 'dark_mode', 'dashboard', 'dashboard_customize', 'data_array', 'data_exploration', 'data_object', 'data_thresholding', 'database', 'dataset', 'dataset_linked', 'date_range', 'deblur', 'dehaze', 'delete', 'delete_forever', 'delete_sweep', 'density_large', 'density_medium', 'density_small', 'dentistry', 'departure_board', 'description', 'description', 'deselect', 'design_services', 'details', 'dialer_sip', 'dialpad', 'diamond', 'difference', 'digital_out_of_home', 'directions', 'directions_alt', 'directions_alt_off', 'directions_bike', 'directions_boat', 'directions_bus', 'directions_car', 'directions_off', 'directions_railway', 'directions_run', 'directions_subway', 'directions_walk', 'dirty_lens', 'disabled_by_default', 'discover_tune', 'diversity_1', 'diversity_2', 'diversity_3', 'diversity_4', 'do_not_disturb_off', 'do_not_disturb_on', 'docs_add_on', 'docs_apps_script', 'document_scanner', 'domain', 'domain_add', 'domain_disabled', 'domain_verification', 'done', 'done_all', 'done_outline', 'donut_large', 'donut_small', 'double_arrow', 'downhill_skiing', 'download', 'download_done', 'download_for_offline', 'downloading', 'draft', 'drafts', 'drag_handle', 'drag_indicator', 'draw', 'dry_cleaning', 'duo', 'dynamic_feed', 'dynamic_form', 'e911_avatar', 'east', 'eco', 'edit', 'edit', 'edit_attributes', 'edit_calendar', 'edit_document', 'edit_location', 'edit_location_alt', 'edit_note', 'edit_notifications', 'edit_off', 'edit_road', 'edit_square', 'egg', 'egg_alt', 'eject', 'elderly', 'elderly_woman', 'electric_bike', 'electric_car', 'electric_moped', 'electric_rickshaw', 'electric_scooter', 'electrical_services', 'emergency', 'emoji_flags', 'emoji_food_beverage', 'emoji_nature', 'emoji_objects', 'emoji_people', 'emoji_symbols', 'emoji_transportation', 'empty_dashboard', 'enable', 'engineering', 'equalizer', 'error', 'euro', 'euro_symbol', 'ev_shadow', 'ev_station', 'event', 'event_available', 'event_busy', 'event_note', 'event_repeat', 'event_upcoming', 'exit_to_app', 'expand', 'expand_circle_down', 'expand_less', 'expand_more', 'explicit', 'explore', 'explore_off', 'exposure', 'exposure_neg_1', 'exposure_neg_2', 'exposure_plus_1', 'exposure_plus_2', 'exposure_zero', 'extension', 'extension_off', 'face', 'face_2', 'face_3', 'face_4', 'face_5', 'face_6', 'face_retouching_natural', 'face_retouching_off', 'fact_check', 'factory', 'fast_forward', 'fast_rewind', 'fastfood', 'favorite', 'featured_play_list', 'featured_video', 'feed', 'female', 'femur', 'femur_alt', 'fiber_dvr', 'fiber_manual_record', 'fiber_new', 'fiber_pin', 'fiber_smart_record', 'file_copy', 'file_download', 'file_download_done', 'file_download_off', 'file_open', 'file_present', 'file_upload', 'file_upload_off', 'filter', 'filter_1', 'filter_2', 'filter_3', 'filter_4', 'filter_5', 'filter_6', 'filter_7', 'filter_8', 'filter_9', 'filter_9_plus', 'filter_alt', 'filter_alt_off', 'filter_b_and_w', 'filter_center_focus', 'filter_drama', 'filter_frames', 'filter_hdr', 'filter_list', 'filter_list_off', 'filter_none', 'filter_tilt_shift', 'filter_vintage', 'finance_chip', 'find_in_page', 'find_replace', 'fingerprint', 'fire_hydrant', 'fire_truck', 'first_page', 'fit_screen', 'flag', 'flag_circle', 'flaky', 'flare', 'flash_auto', 'flash_off', 'flash_on', 'flight', 'flight_class', 'flight_land', 'flight_takeoff', 'flip', 'flip_camera_android', 'flip_camera_ios', 'flip_to_back', 'flip_to_front', 'flood', 'fluorescent', 'flutter_dash', 'fmd_bad', 'foggy', 'folder', 'folder_copy', 'folder_delete', 'folder_off', 'folder_open', 'folder_shared', 'folder_special', 'folder_zip', 'follow_the_signs', 'font_download', 'font_download_off', 'foot_bones', 'forest', 'fork_left', 'fork_right', 'format_align_center', 'format_align_justify', 'format_align_left', 'format_align_right', 'format_bold', 'format_clear', 'format_color_fill', 'format_color_reset', 'format_color_text', 'format_h1', 'format_h2', 'format_h3', 'format_h4', 'format_h5', 'format_h6', 'format_image_left', 'format_image_right', 'format_indent_decrease', 'format_indent_increase', 'format_italic', 'format_line_spacing', 'format_list_bulleted', 'format_list_bulleted_add', 'format_list_numbered', 'format_list_numbered_rtl', 'format_overline', 'format_paint', 'format_paragraph', 'format_quote', 'format_shapes', 'format_size', 'format_strikethrough', 'format_textdirection_l_to_r', 'format_textdirection_r_to_l', 'format_underlined', 'format_underlined_squiggle', 'forms_add_on', 'forms_apps_script', 'fort', 'forum', 'forward', 'forward_10', 'forward_30', 'forward_5', 'forward_to_inbox', 'frame_person', 'free_cancellation', 'front_hand', 'full_stacked_bar_chart', 'fullscreen', 'fullscreen_exit', 'function', 'functions', 'garden_cart', 'gavel', 'generating_tokens', 'gesture', 'gif', 'gif_box', 'girl', 'glyphs', 'grade', 'gradient', 'grading', 'grain', 'grid_off', 'grid_on', 'grid_view', 'group', 'group_add', 'group_off', 'group_remove', 'group_work', 'grouped_bar_chart', 'groups', 'groups_2', 'groups_3', 'hail', 'hand_bones', 'hand_gesture', 'handshake', 'handyman', 'hd', 'hdr_auto', 'hdr_auto_select', 'hdr_enhanced_select', 'hdr_off', 'hdr_off_select', 'hdr_on', 'hdr_on_select', 'hdr_plus', 'hdr_strong', 'hdr_weak', 'healing', 'health_and_safety', 'hearing', 'hearing_disabled', 'heart_broken', 'heart_minus', 'heart_plus', 'height', 'help', 'help_center', 'hevc', 'hexagon', 'hide', 'hide_image', 'hide_source', 'high_quality', 'hiking', 'history', 'history_edu', 'history_toggle_off', 'hive', 'hls', 'hls_off', 'home', 'home_pin', 'home_repair_service', 'home_work', 'horizontal_distribute', 'horizontal_rule', 'horizontal_split', 'hotel_class', 'hourglass_bottom', 'hourglass_disabled', 'hourglass_empty', 'hourglass_full', 'hourglass_top', 'house', 'how_to_reg', 'how_to_vote', 'html', 'http', 'hub', 'humerus', 'humerus_alt', 'image', 'image_aspect_ratio', 'image_not_supported', 'image_search', 'imagesearch_roller', 'imagesmode', 'import_contacts', 'inbox', 'inbox_customize', 'incomplete_circle', 'indeterminate_check_box', 'info', 'input', 'insert_chart',
	'insert_page_break', 'insights', 'install_desktop', 'install_mobile', 'integration_instructions', 'interests', 'interpreter_mode', 'inventory', 'inventory_2', 'invert_colors', 'invert_colors_off', 'ios_share', 'javascript', 'join', 'join_full', 'join_inner', 'join_left', 'join_right', 'kayaking', 'kebab_dining', 'key', 'key_off', 'keyboard_command_key', 'keyboard_control_key', 'keyboard_double_arrow_down', 'keyboard_double_arrow_left', 'keyboard_double_arrow_right', 'keyboard_double_arrow_up', 'keyboard_option_key', 'keyboard_voice', 'label', 'label_important', 'label_off', 'lan', 'landscape', 'landslide', 'language', 'last_page', 'launch', 'layers', 'layers_clear', 'leaderboard', 'leak_add', 'leak_remove', 'legend_toggle', 'lens', 'lens_blur', 'library_add', 'library_add_check', 'library_books', 'library_music', 'lightbulb', 'lightbulb_circle', 'line_axis', 'line_style', 'line_weight', 'linear_scale', 'link', 'link_off', 'linked_camera', 'liquor', 'list', 'list_alt', 'live_help', 'live_tv', 'local_activity', 'local_airport', 'local_atm', 'local_bar', 'local_cafe', 'local_car_wash', 'local_convenience_store', 'local_dining', 'local_drink', 'local_fire_department', 'local_florist', 'local_gas_station', 'local_grocery_store', 'local_hospital', 'local_laundry_service', 'local_library', 'local_mall', 'local_hotel', 'local_movies', 'local_offer', 'local_parking', 'local_pharmacy', 'local_phone', 'local_pizza', 'local_play', 'local_police', 'local_printshop', 'local_see', 'local_shipping', 'local_shipping', 'local_taxi', 'location_automation', 'location_away', 'location_chip', 'location_disabled', 'location_home', 'location_off', 'location_on', 'location_searching', 'lock', 'lock_clock', 'lock_open', 'lock_person', 'lock_reset', 'login', 'logout', 'looks', 'looks_3', 'looks_4', 'looks_5', 'looks_6', 'looks_one', 'looks_two', 'loupe', 'low_priority', 'loyalty', 'lyrics', 'magic_button', 'mail', 'mail', 'mail_lock', 'male', 'man', 'man_2', 'man_3', 'man_4', 'manage_accounts', 'manage_history', 'manage_search', 'map', 'maps_ugc', 'margin', 'mark_as_unread', 'mark_chat_read', 'mark_chat_unread', 'mark_email_read', 'mark_email_unread', 'mark_unread_chat_alt', 'markunread_mailbox', 'masks', 'maximize', 'mediation', 'medical_information', 'medical_services', 'medication', 'medication_liquid', 'meeting_room', 'menu', 'menu_book', 'menu_open', 'merge_type', 'mic', 'mic_external_off', 'mic_external_on', 'mic_off', 'military_tech', 'minimize', 'minor_crash', 'missed_video_call', 'mms', 'mode_comment', 'mode_of_travel', 'model_training', 'monetization_on', 'money', 'money_off', 'monitor_heart', 'monitoring', 'monochrome_photos', 'mood', 'mood_bad', 'more', 'more_down', 'more_horiz', 'more_time', 'more_up', 'more_vert', 'mosque', 'motion_blur', 'motion_photos_auto', 'motion_photos_off', 'motion_photos_paused', 'motorcycle', 'move_down', 'move_to_inbox', 'move_up', 'movie', 'movie_filter', 'moving', 'mp', 'multiline_chart', 'multiple_stop', 'music_note', 'music_off', 'music_video', 'my_location', 'nat', 'nature', 'nature_people', 'navigate_before', 'navigate_next', 'navigation', 'near_me', 'near_me_disabled', 'new_label', 'new_releases', 'newspaper', 'next_plan', 'next_week', 'night_sight_auto', 'night_sight_auto_off', 'nights_stay', 'no_accounts', 'no_adult_content', 'no_crash', 'no_flash', 'no_meals', 'no_meeting_room', 'no_photography', 'no_transfer', 'north', 'north_east', 'north_west', 'not_accessible', 'not_listed_location', 'not_started', 'note', 'note_add', 'note_alt', 'notes', 'notification_add', 'notification_important', 'notifications', 'notifications_active', 'notifications_off', 'notifications_paused', 'numbers', 'offline_bolt', 'offline_pin', 'oil_barrel', 'on_device_training', 'online_prediction', 'opacity', 'open_in_browser', 'open_in_full', 'open_in_new', 'open_in_new_off', 'open_with', 'orthopedics', 'outbound', 'outbox', 'outdoor_garden', 'outgoing_mail', 'output', 'package', 'padding', 'pages', 'pageview', 'paid', 'palette', 'pan_tool', 'pan_tool_alt', 'panorama', 'panorama_fish_eye', 'panorama_horizontal', 'panorama_photosphere', 'panorama_vertical', 'panorama_wide_angle', 'park', 'partly_cloudy_day', 'partly_cloudy_night', 'party_mode', 'pause', 'pause_circle', 'pause_presentation', 'payments', 'pedal_bike', 'pending', 'pending_actions', 'pentagon', 'percent', 'pergola', 'perm_camera_mic', 'perm_contact_calendar', 'perm_media', 'perm_phone_msg', 'person', 'person', 'person_2', 'person_3', 'person_4', 'person_add', 'person_add_disabled', 'person_filled', 'person_off', 'person_pin', 'person_pin_circle', 'person_remove', 'person_search', 'personal_injury', 'pest_control', 'pest_control_rodent', 'pets', 'phone_bluetooth_speaker', 'phone_callback', 'phone_disabled', 'phone_enabled', 'phone_forwarded', 'phone_in_talk', 'phone_iphone', 'phone_locked', 'phone_missed', 'phone_paused', 'phonelink_erase', 'phonelink_lock', 'phonelink_ring', 'photo', 'photo_album', 'photo_camera', 'photo_camera_back', 'photo_camera_front', 'photo_filter', 'photo_frame', 'photo_library', 'photo_size_select_large', 'photo_size_select_small', 'php', 'piano', 'picture_as_pdf', 'picture_in_picture', 'picture_in_picture_alt', 'pie_chart', 'pin_drop', 'pin_drop', 'pin_end', 'pin_invoke', 'pinch', 'pinch_zoom_in', 'pinch_zoom_out', 'pivot_table_chart', 'place_item', 'plagiarism', 'play_arrow', 'play_arrow', 'play_circle', 'play_disabled', 'play_for_work', 'play_lesson', 'play_pause', 'playlist_add', 'playlist_add_check', 'playlist_add_check_circle', 'playlist_add_circle', 'playlist_play', 'playlist_remove', 'plumbing', 'podcasts', 'polyline', 'post_add', 'potted_plant', 'power_settings_new', 'precision_manufacturing', 'pregnant_woman', 'present_to_all', 'preview', 'price_change', 'price_check', 'priority', 'priority_high', 'privacy', 'process_chart', 'production_quantity_limits', 'psychology', 'psychology_alt', 'public', 'public_off', 'publish', 'published_with_changes', 'push_pin', 'qr_code', 'qr_code_2', 'qr_code_scanner', 'query_stats', 'question_mark', 'queue_music', 'queue_play_next', 'quickreply', 'quiz', 'radio', 'radio_button_checked', 'radio_button_unchecked', 'radiology', 'railway_alert', 'rainy', 'rate_review', 'raw_off', 'raw_on', 'read_more', 'real_estate_agent', 'rebase', 'rebase_edit', 'receipt', 'receipt_long', 'recent_actors', 'recommend', 'record_voice_over', 'rectangle', 'recycling', 'redeem', 'redo', 'reduce_capacity',
	'refresh', 'remove', 'remove_done', 'remove_from_queue', 'remove_road', 'remove_shopping_cart', 'reorder', 'repartition', 'repeat', 'repeat_on', 'repeat_one', 'repeat_one_on', 'replay', 'replay_10', 'replay_30', 'replay_5', 'replay_circle_filled', 'reply', 'reply_all', 'request_page', 'request_quote', 'restart_alt', 'restaurant', 'restaurant_menu', 'restore_from_trash', 'restore_page', 'reviews', 'rheumatology', 'rib_cage', 'ring_volume', 'rocket', 'rocket_launch', 'room_preferences', 'rotate_90_degrees_ccw', 'rotate_90_degrees_cw', 'rotate_left', 'rotate_right', 'rounded_corner', 'routine', 'rsvp', 'rtt', 'rule', 'rule_folder', 'run_circle', 'running_with_errors', 'rv_hookup', 'safety_check', 'safety_divider', 'sailing', 'sanitizer', 'satellite', 'satellite_alt', 'save_as', 'saved_search', 'savings', 'scatter_plot', 'schedule', 'schedule_send', 'schema', 'school', 'school', 'science', 'score', 'sd', 'search', 'search', 'search_off', 'segment', 'select_all', 'select_check_box', 'self_improvement', 'sell', 'send', 'send_and_archive', 'send_time_extension', 'sentiment_dissatisfied', 'sentiment_extremely_dissatisfied', 'sentiment_neutral', 'sentiment_satisfied', 'sentiment_very_dissatisfied', 'sentiment_very_satisfied', 'set_meal', 'settings', 'settings_accessibility', 'settings_applications', 'settings_backup_restore', 'settings_bluetooth', 'settings_brightness', 'settings_overscan', 'settings_phone', 'settings_power', 'settings_suggest', 'settings_voice', 'severe_cold', 'shape_line', 'share', 'share_location', 'share_reviews', 'shop', 'shop_two', 'shopping_bag', 'shopping_basket', 'shopping_cart', 'shopping_cart', 'shopping_cart_checkout', 'short_text', 'show_chart', 'shuffle', 'shuffle_on', 'shutter_speed', 'sick', 'sign_language', 'signpost', 'sip', 'skeleton', 'skip_next', 'skip_previous', 'skull', 'slideshow', 'slow_motion_video', 'smart_button', 'sms', 'sms_failed', 'snippet_folder', 'snooze', 'snowing', 'snowmobile', 'social_distance', 'solar_power', 'sort', 'sort_by_alpha', 'sos', 'sound_detection_dog_barking', 'sound_detection_glass_break', 'sound_detection_loud_sound', 'soup_kitchen', 'south', 'south_america', 'south_east', 'south_west', 'space_bar', 'space_dashboard', 'spatial_audio', 'spatial_audio_off', 'spatial_tracking', 'speaker_notes', 'speaker_notes_off', 'speaker_phone', 'specific_gravity', 'speech_to_text', 'speed', 'spellcheck', 'spoke', 'sports', 'sports_baseball', 'sports_basketball', 'sports_esports', 'sports_gymnastics', 'sports_kabaddi', 'sports_martial_arts', 'sports_motorsports', 'sports_score', 'sports_soccer', 'sports_tennis', 'sports_volleyball', 'square', 'square_foot', 'ssid_chart', 'stacked_bar_chart', 'stacked_line_chart', 'stadia_controller', 'stadium', 'star', 'star_half', 'star_rate', 'stars', 'start', 'sticky_note_2', 'stop', 'stop_circle', 'store', 'storefront', 'straighten', 'stream', 'streetview', 'strikethrough_s', 'style', 'subdirectory_arrow_left', 'subdirectory_arrow_right', 'subject', 'subscript', 'subscriptions', 'subtitles', 'subtitles_off', 'subway', 'summarize', 'sunny', 'sunny_snowing', 'superscript', 'supervised_user_circle', 'supervisor_account', 'support', 'support_agent', 'surfing', 'surround_sound', 'swap_calls', 'swap_horiz', 'swap_horizontal_circle', 'swap_vert', 'swap_vertical_circle', 'swipe', 'swipe_down', 'swipe_down_alt', 'swipe_left', 'swipe_left_alt', 'swipe_right', 'swipe_right_alt', 'swipe_up', 'swipe_up_alt', 'swipe_vertical', 'switch_access_shortcut', 'switch_access_shortcut_add', 'switch_account', 'switch_camera', 'switch_left', 'switch_right', 'switch_video', 'synagogue', 'sync', 'sync_alt', 'sync_disabled', 'sync_problem', 'system_update_alt', 'tab', 'tab_unselected', 'table', 'table_chart', 'table_rows', 'table_view', 'tag', 'takeout_dining', 'task', 'task_alt', 'taxi_alert', 'team_dashboard', 'temple_buddhist', 'temple_hindu', 'tenancy', 'terminal', 'text_decrease', 'text_fields', 'text_format', 'text_increase', 'text_rotate_up', 'text_rotate_vertical', 'text_rotation_angledown', 'text_rotation_angleup', 'text_rotation_down', 'text_rotation_none', 'text_snippet', 'text_to_speech', 'texture', 'theater_comedy', 'theaters', 'thumb_down', 'thumb_down_off', 'thumb_up', 'thumb_up_off', 'thumbs_up_down', 'thunderstorm', 'tibia', 'tibia_alt', 'time_auto', 'timelapse', 'timeline', 'timer', 'timer_10', 'timer_10_alt_1', 'timer_3', 'timer_3_alt_1', 'timer_off', 'tips_and_updates', 'tire_repair', 'title', 'toc', 'today', 'toggle_off', 'toggle_on', 'token', 'toll', 'tonality', 'topic', 'tornado', 'touch_app', 'tour', 'toys', 'track_changes', 'traffic', 'trail_length', 'trail_length_medium', 'trail_length_short', 'train', 'tram', 'transcribe', 'transfer_within_a_station', 'transform', 'transgender', 'transit_enterexit', 'translate', 'transportation', 'travel_explore', 'trending_down', 'trending_flat', 'trending_up', 'trip_origin', 'tsunami', 'tune', 'turn_left', 'turn_right', 'turn_sharp_left', 'turn_sharp_right', 'turn_slight_left', 'turn_slight_right', 'two_wheeler', 'type_specimen', 'u_turn_left', 'u_turn_right', 'ulna_radius', 'ulna_radius_alt', 'unarchive', 'undo', 'unfold_less', 'unfold_less_double', 'unfold_more', 'unfold_more_double', 'unpublished', 'unsubscribe', 'upcoming', 'update', 'update_disabled', 'upgrade', 'upload', 'upload_file', 'vaccines', 'vape_free', 'vaping_rooms', 'variables', 'verified', 'vertical_align_bottom', 'vertical_align_center', 'vertical_align_top', 'vertical_distribute', 'vertical_split', 'video_call', 'video_camera_back', 'video_camera_front',
	'video_chat', 'video_file', 'video_label', 'video_library', 'video_settings', 'video_stable', 'videocam', 'videocam_off', 'view_agenda', 'view_array', 'view_carousel', 'view_column', 'view_column_2', 'view_comfy', 'view_comfy_alt', 'view_compact', 'view_compact_alt', 'view_cozy', 'view_day', 'view_headline', 'view_in_ar', 'view_kanban', 'view_list', 'view_module', 'view_quilt', 'view_sidebar', 'view_stream', 'view_timeline', 'view_week', 'vignette', 'visibility', 'visibility_off', 'voice_chat', 'voice_over_off', 'voicemail', 'volcano', 'volume_down', 'volume_down_alt', 'volume_mute', 'volume_off', 'volume_up', 'volunteer_activism', 'voting_chip', 'vpn_key_off', 'vpn_lock', 'vrpano', 'wallet', 'warehouse', 'warning', 'water', 'water_drop', 'waterfall_chart', 'waves', 'waving_hand', 'wb_auto', 'wb_incandescent', 'wb_iridescent', 'wb_shade', 'wb_sunny', 'wb_twilight', 'wc', 'web', 'web_asset', 'web_asset_off', 'web_stories', 'weight', 'west', 'whatshot', 'where_to_vote', 'width_full', 'width_normal', 'width_wide', 'wifi_calling', 'wifi_channel', 'wifi_protected_setup', 'wind_power', 'wine_bar', 'woman', 'woman_2', 'work', 'work_history', 'workspace_premium', 'workspaces', 'wrap_text', 'wrong_location', 'wysiwyg', 'youtube_searched_for', 'zoom_in', 'zoom_in_map', 'zoom_out', 'zoom_out_map'
)

const variants = [SymbolVariant.Sharp, SymbolVariant.Outlined, SymbolVariant.Rounded]

export default meta({
	title: 'Symbol',
	component: 'mo-symbol',
	argTypes: {
		icon: { control: { type: 'select', options: icons } },
		variant: { control: { type: 'select', options: variants } },
		fill: {},
		weight: {},
		grade: {},
		opticalScale: {},
	},
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Symbol = story({
	args: {
		icon: 'verified' as MaterialSymbol,
		variant: SymbolVariant.Rounded,
		fill: '0',
		weight: '500',
		grade: '50',
		opticalScale: '48',
	},
	render: ({ variant, icon, fill, grade, opticalScale, weight }) => html`
		<mo-symbol ${style({ color: 'rgb(200,200,200)', mixBlendMode: 'difference', fontSize: '48px' })}
			variant=${variant}
			icon=${icon}
			fill=${fill}
			grade=${grade}
			opticalScale=${opticalScale}
			weight=${weight}
		></mo-symbol>
	`
})

export const List = story({
	args: {
		variant: SymbolVariant.Rounded,
		fill: '0',
		weight: '500',
		grade: '50',
		opticalScale: '48',
	},
	render: ({ variant, fill, grade, opticalScale, weight }) => html`
		<mo-grid gap='10px' columns='repeat(auto-fit, minmax(100px, 1fr))' ${style({ color: 'rgb(200,200,200)', mixBlendMode: 'difference' })}>
			${icons.map(icon => html`
				<mo-flex alignItems='center' justifyContent='center' gap='10px' ${style({ margin: '10px' })}>
					<mo-symbol ${style({ fontSize: '48px' })}
						variant=${variant}
						icon=${icon}
						fill=${fill}
						grade=${grade}
						opticalScale=${opticalScale}
						weight=${weight}
					></mo-symbol>
					<div title=${icon} ${style({ userSelect: 'all', textAlign: 'center', width: '100%', overflowWrap: 'anywhere' })}>${icon}</div>
				</mo-flex>
			`)}
		</mo-grid>
	`
})