
-- Update handle_new_user to also assign all phase-1 tasks to new students
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  -- Auto-assign phase 1, week 1 tasks
  INSERT INTO public.student_tasks (task_id, user_id, status)
  SELECT id, NEW.id, 'pending'
  FROM public.tasks
  WHERE phase = 1 AND week <= 2;
  
  RETURN NEW;
END;
$$;
