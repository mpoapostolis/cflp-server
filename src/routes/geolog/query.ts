const query = (lat, long) => `with t0 as 
(   select 
        users.id, 
        first_name, 
        gender, 
        geo_log_events.date_created,
        (Select  Cast(extract(year FROM AGE(NOW(), birthday)) as int)) as age
    from geo_log_events inner join users on user_id = users.id 
    where ST_DWithin("geom", geography(ST_MakePoint(${long}, ${lat})), 1500) 
    AND geo_log_events.date_created > NOW() - INTERVAL '180 seconds'
    
), t1 as (
    select 
        age,
        gender,
       CASE
           WHEN age > 13
                AND age <= 17 AND gender = 'male' THEN 'male_age_13_17'
           WHEN age > 18
                AND age <= 24 AND gender = 'male' THEN 'male_age_18_24'
           WHEN age > 25
                AND age <= 34 AND gender = 'male' THEN 'male_age_25_34'
           WHEN age > 35
                AND age <= 44 AND gender = 'male' THEN 'male_age_35_44'
           WHEN age > 45
                AND age <= 54 AND gender = 'male' THEN 'male_age_45_54'
           WHEN age > 55
                AND age <= 64 AND gender = 'male' THEN 'male_age_55_64'
           WHEN age > 65 AND gender = 'male' THEN 'male_age_65_plus'
           WHEN  gender = 'male' THEN 'male_uknown'

           WHEN age > 13
                AND age <= 17 AND gender = 'female' THEN 'female_age_13_17'
           WHEN age > 18
                AND age <= 24 AND gender = 'female' THEN 'female_age_18_24'
           WHEN age > 25
                AND age <= 34 AND gender = 'female' THEN 'female_age_25_34'
           WHEN age > 35
                AND age <= 44 AND gender = 'female' THEN 'female_age_35_44'
           WHEN age > 45    
                AND age <= 54 AND gender = 'female' THEN 'female_age_45_54'
           WHEN age > 55
                AND age <= 64 AND gender = 'female' THEN 'female_age_55_64'
           WHEN age > 65 AND gender = 'female' THEN 'female_age_65_plus'
           WHEN  gender = 'female' THEN 'female_uknown'

           ELSE 'unkown'
       END age_group
    from t0
)
select age_group,count(*) as total from t1 group by age_group;

`
export default query
