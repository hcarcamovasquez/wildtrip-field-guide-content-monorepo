INSERT INTO public.users (id, clerk_id, email, username, first_name, last_name, full_name, avatar_url, bio, is_active,
                          role, created_at, updated_at)
VALUES (1, 'user_30BmmrWilJGCfsmzjCwixD8ihUV', 'hcarcamovasquez@gmail.com', 'hcarcamovasquez', 'Humberto',
        'Carcamo Vasquez', 'Humberto Carcamo Vasquez', null, null, true, 'admin', '2025-07-22 04:15:26.727000',
        '2025-07-22 04:15:26.727000')
on conflict do nothing;
INSERT INTO public.users (id, clerk_id, email, username, first_name, last_name, full_name, avatar_url, bio, is_active,
                          role, created_at, updated_at)
VALUES (2, 'user_30BqmTZTZHqFWbNv2cxueXkqP47', 'humberto@wildtrip.cl', 'hcarcamo', 'Humberto', 'Carcamo Vasquez',
        'Humberto Carcamo Vasquez', null, null, true, 'content_editor', '2025-07-22 04:15:26.729000',
        '2025-07-22 04:15:26.729000')
on conflict do nothing;
INSERT INTO public.users (id, clerk_id, email, username, first_name, last_name, full_name, avatar_url, bio, is_active,
                          role, created_at, updated_at)
VALUES (3, 'user_30BjOpbFxTY4D4a97TpsDPjK2S6', 'hcarcamovasquez+clerk_test@example.com', 'hcarcamo', 'Humberto',
        'Carcamo Vasquez', 'Humberto Carcamo Vasquez', null, null, true, 'content_editor', '2025-07-22 04:15:26.730000',
        '2025-07-22 04:15:26.730000')
on conflict do nothing;
