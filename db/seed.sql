-- DEMO DATA ONLY. Every row is flagged is_demo = true. Re-running replaces demo rows only.
delete from campaign_events where is_demo;
delete from students where is_demo;

insert into colleges (name, slug, city) values
 ('MSRIT','msrit','Bengaluru'),('BMSCE','bmsce','Bengaluru'),('RVCE','rvce','Bengaluru'),
 ('PES University','pes','Bengaluru'),('Dayananda Sagar','dsce','Bengaluru'),
 ('NMIT','nmit','Bengaluru'),('BIT','bit','Bengaluru'),('Sir MVIT','sirmvit','Bengaluru')
on conflict (slug) do nothing;

do $$
declare
  v_first text[] := array['Rahul','Priya','Arjun','Sneha','Karthik','Ananya','Vikram','Divya','Rohan','Meera',
                          'Aditya','Kavya','Siddharth','Pooja','Nikhil','Isha','Varun','Neha','Harsha','Lakshmi',
                          'Manoj','Swathi','Pranav','Deepika','Suraj'];
  v_last text[] := array['Sharma','Rao','Nair','Gowda','Iyer','Reddy','Patel','Kumar','Shetty','Hegde'];
  v_slugs text[] := array['bmsce','msrit','rvce','pes','dsce','nmit','bit','sirmvit'];
  v_branches text[] := array['CSE','ISE','AI & DS','ECE','CSE'];
  v_ws uuid; v_cid uuid; v_cid2 uuid; v_amb uuid; v_stu uuid;
  v_n int; v_score int; v_tier text; v_ts timestamptz; v_i int; v_j int;
begin
  select id into v_ws from workshops where is_active order by starts_at limit 1;
  for v_i in 1..25 loop
    select id into v_cid from colleges where slug = v_slugs[1 + (v_i % 8)];
    v_score := 45 + floor(random() * 50)::int;
    v_tier := case when v_score <= 30 then 'AI Explorer' when v_score <= 60 then 'AI Learner'
                   when v_score <= 80 then 'Builder in Progress' else 'AI Builder' end;
    v_ts := now() - random() * interval '6 days';
    insert into students (name, email, college_id, branch, grad_year, readiness_score, readiness_tier,
                          referral_code, dashboard_token, is_ambassador, is_demo, created_at)
    values (v_first[v_i] || ' ' || v_last[1 + (v_i % 10)], 'demo.amb' || v_i || '@demo.ai60.test', v_cid,
            v_branches[1 + (v_i % 5)], 2026, v_score, v_tier,
            'AI60-DEMO-A' || lpad(v_i::text, 3, '0'), encode(gen_random_bytes(24), 'hex'), true, true, v_ts)
    returning id into v_amb;
    insert into registrations (student_id, workshop_id, source, created_at) values (v_amb, v_ws, 'ambassador', v_ts);
    insert into ambassadors (student_id, motivation, created_at) values (v_amb, 'Demo ambassador', v_ts);

    v_n := round(28 * power(0.93, v_i - 1))::int;
    for v_j in 1..v_n loop
      v_cid2 := case when random() < 0.7 then v_cid else (select id from colleges order by random() limit 1) end;
      v_score := 20 + floor(random() * 75)::int;
      v_tier := case when v_score <= 30 then 'AI Explorer' when v_score <= 60 then 'AI Learner'
                     when v_score <= 80 then 'Builder in Progress' else 'AI Builder' end;
      v_ts := now() - random() * interval '6 days';
      insert into students (name, email, college_id, branch, grad_year, readiness_score, readiness_tier,
                            referral_code, dashboard_token, is_demo, created_at)
      values (v_first[1 + (v_j % 25)] || ' ' || v_last[1 + ((v_j + v_i) % 10)],
              'demo.s' || v_i || '-' || v_j || '@demo.ai60.test', v_cid2,
              v_branches[1 + (v_j % 5)], 2026, v_score, v_tier,
              'AI60-DEMO-' || v_i || '-' || v_j, encode(gen_random_bytes(24), 'hex'), true, v_ts)
      returning id into v_stu;
      insert into registrations (student_id, workshop_id, source, created_at) values (v_stu, v_ws, 'referral', v_ts);
      insert into referrals (referrer_id, referred_id, created_at) values (v_amb, v_stu, v_ts);
    end loop;
  end loop;
end $$;

-- 60 demo project submissions
insert into projects (student_id, name, problem, github_url, tech_stack, description, created_at)
select s.id, 'Demo Project ' || s.rn, 'Demo problem statement for simulated data',
       'https://github.com/demo-user-' || s.rn || '/ai60-project',
       'Python, Streamlit, LLM API',
       (array['Resume analyzer that scores resumes against a job description using an LLM.',
              'Study-notes summarizer that turns lecture PDFs into flashcards.',
              'Campus FAQ chatbot answering questions from college documents.',
              'Interview practice bot that asks questions and grades answers.',
              'Expense tracker that categorizes bank messages using AI.'])[(1 + (s.rn % 5))::int],
       now() - random() * interval '2 days'
from (select id, row_number() over (order by created_at) as rn from students where is_demo) s
where s.rn <= 60;

-- Simulated funnel events (clearly flagged is_demo)
insert into campaign_events (event_name, visitor_id, properties, is_demo, created_at)
select e.name, 'demo-v-' || n,
       case when e.name = 'landing_page_view' then jsonb_build_object('source',
         case when n % 20 < 11 then 'ambassador' when n % 20 < 15 then 'college_community'
              when n % 20 < 17 then 'linkedin' when n % 20 < 19 then 'paid' else 'direct' end)
       else '{}'::jsonb end,
       true, now() - random() * interval '7 days'
from (values
  ('landing_page_view', 4200),
  ('challenge_started', 1650),
  ('challenge_completed', 1180),
  ('registration_started', 430),
  ('registration_completed', (select count(*)::int from students where is_demo)),
  ('referral_link_copied', 780),
  ('referral_shared', 540),
  ('referral_registration', (select count(*)::int from referrals r join students s on s.id = r.referred_id where s.is_demo)),
  ('project_submitted', (select count(*)::int from projects p join students s on s.id = p.student_id where s.is_demo)),
  ('evaluation_completed', 52)
) as e(name, cnt)
join generate_series(1, 4200) as n on n <= e.cnt;
