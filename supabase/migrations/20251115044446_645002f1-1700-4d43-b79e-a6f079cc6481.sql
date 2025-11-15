-- Add DELETE policy for error_notifications
CREATE POLICY "Admins can delete notifications"
ON public.error_notifications
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));