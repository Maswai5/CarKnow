--
-- PostgreSQL database dump
--

\restrict T2qAbnCoaelCFMKKGGteOqJ4SSI2bwNFjT9UPOZ2PWw7Tt50upTn41sb5HWg1hn

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: check_mileage_increase(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_mileage_increase() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.mileage < OLD.mileage THEN
    RAISE EXCEPTION 'Mileage cannot decrease (old: %, new: %)', OLD.mileage, NEW.mileage;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.check_mileage_increase() OWNER TO postgres;

--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_updated_at() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accidents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accidents (
    id integer NOT NULL,
    car_id integer,
    accident_date date NOT NULL,
    description text,
    severity character varying(20),
    repaired boolean DEFAULT false
);


ALTER TABLE public.accidents OWNER TO postgres;

--
-- Name: accidents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.accidents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.accidents_id_seq OWNER TO postgres;

--
-- Name: accidents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.accidents_id_seq OWNED BY public.accidents.id;


--
-- Name: cars; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cars (
    id integer NOT NULL,
    vin character varying(50) NOT NULL,
    make character varying(50),
    model character varying(50),
    year integer,
    mileage integer,
    status character varying(20) DEFAULT 'available'::character varying,
    plate character varying(20),
    accident_history text,
    service_records text,
    insurance_status character varying(50),
    valuation numeric,
    last_checked timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    owners_count integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT mileage_non_negative CHECK ((mileage >= 0))
);


ALTER TABLE public.cars OWNER TO postgres;

--
-- Name: cars_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cars_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cars_id_seq OWNER TO postgres;

--
-- Name: cars_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cars_id_seq OWNED BY public.cars.id;


--
-- Name: ownership_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ownership_history (
    id integer NOT NULL,
    car_id integer,
    previous_owner text,
    new_owner text,
    acquired_on date,
    transferred_by text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    mileage integer
);


ALTER TABLE public.ownership_history OWNER TO postgres;

--
-- Name: ownership_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ownership_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ownership_history_id_seq OWNER TO postgres;

--
-- Name: ownership_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ownership_history_id_seq OWNED BY public.ownership_history.id;


--
-- Name: ownerships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ownerships (
    id integer NOT NULL,
    car_id integer,
    owner_name text NOT NULL,
    acquired_on date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ownerships OWNER TO postgres;

--
-- Name: ownerships_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ownerships_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ownerships_id_seq OWNER TO postgres;

--
-- Name: ownerships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ownerships_id_seq OWNED BY public.ownerships.id;


--
-- Name: report_views; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.report_views (
    id integer NOT NULL,
    car_id integer,
    user_id integer,
    role character varying(20),
    action character varying(50),
    viewed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.report_views OWNER TO postgres;

--
-- Name: report_views_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.report_views_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.report_views_id_seq OWNER TO postgres;

--
-- Name: report_views_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.report_views_id_seq OWNED BY public.report_views.id;


--
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id integer NOT NULL,
    car_id integer,
    service_date date NOT NULL,
    description text,
    service_type character varying(50),
    service_center text,
    notes text,
    mileage integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.services OWNER TO postgres;

--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_id_seq OWNER TO postgres;

--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password text NOT NULL,
    role character varying(20) DEFAULT 'user'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: accidents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accidents ALTER COLUMN id SET DEFAULT nextval('public.accidents_id_seq'::regclass);


--
-- Name: cars id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cars ALTER COLUMN id SET DEFAULT nextval('public.cars_id_seq'::regclass);


--
-- Name: ownership_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ownership_history ALTER COLUMN id SET DEFAULT nextval('public.ownership_history_id_seq'::regclass);


--
-- Name: ownerships id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ownerships ALTER COLUMN id SET DEFAULT nextval('public.ownerships_id_seq'::regclass);


--
-- Name: report_views id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_views ALTER COLUMN id SET DEFAULT nextval('public.report_views_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: accidents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accidents (id, car_id, accident_date, description, severity, repaired) FROM stdin;
1	1	2018-06-12	Rear bumper damage in minor collision	minor	t
2	6	2023-06-12	Rear bumper damage	minor	t
\.


--
-- Data for Name: cars; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cars (id, vin, make, model, year, mileage, status, plate, accident_history, service_records, insurance_status, valuation, last_checked, owners_count, created_at, updated_at) FROM stdin;
1	K123ABC	Toyota	Corolla	2015	85000	available	\N	\N	\N	\N	\N	2025-12-15 13:18:29.202803	1	2025-12-17 20:22:36.91835	2025-12-17 20:22:36.91835
2	K456DEF	Honda	Civic	2018	60000	available	\N	\N	\N	\N	\N	2025-12-15 13:18:29.202803	1	2025-12-17 20:22:36.91835	2025-12-17 20:22:36.91835
3	K789GHI	Nissan	Sunny	2012	120000	available	\N	\N	\N	\N	\N	2025-12-15 13:18:29.202803	1	2025-12-17 20:22:36.91835	2025-12-17 20:22:36.91835
4	VIN123456789	Toyota	Corolla	2015	85000	available	KAA123X	\N	\N	\N	\N	2025-12-15 13:18:29.202803	1	2025-12-17 20:22:36.91835	2025-12-17 20:22:36.91835
5	VIN987654321	Honda	Civic	2018	45000	available	KBB456Y	2021 minor accident, rear bumper replaced	2022 full service, 2023 brake pads replaced	active	1200000	2025-12-15 13:20:18.440717	2	2025-12-17 20:22:36.91835	2025-12-17 20:22:36.91835
6	KDA123X	Toyota	Axio	2015	46000	available	KDA123X	\N	\N	Active	850000	2025-12-16 17:44:19.787594	2	2025-12-17 20:22:36.91835	2025-12-17 20:22:36.91835
\.


--
-- Data for Name: ownership_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ownership_history (id, car_id, previous_owner, new_owner, acquired_on, transferred_by, created_at, mileage) FROM stdin;
1	6	\N	Brian Kiptoo	2025-12-16	admin	2025-12-17 13:47:33.857726	\N
\.


--
-- Data for Name: ownerships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ownerships (id, car_id, owner_name, acquired_on, created_at, updated_at) FROM stdin;
1	6	John Doe	2018-01-15	2025-12-17 20:22:37.016685	2025-12-17 20:22:37.016685
2	6	Jane Wanjiku	2021-06-10	2025-12-17 20:22:37.016685	2025-12-17 20:22:37.016685
6	6	Brian Kiptoo	2025-12-16	2025-12-17 20:22:37.016685	2025-12-17 20:22:37.016685
\.


--
-- Data for Name: report_views; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.report_views (id, car_id, user_id, role, action, viewed_at) FROM stdin;
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.services (id, car_id, service_date, description, service_type, service_center, notes, mileage, created_at, updated_at) FROM stdin;
1	1	2021-03-20	Full service including oil change and brake pads	full service	\N	\N	\N	2025-12-17 20:22:43.598908	2025-12-17 20:22:43.598908
2	6	2024-03-10	Oil change	routine	Toyota Eldoret	No issues	\N	2025-12-17 20:22:43.598908	2025-12-17 20:22:43.598908
3	6	2025-12-17	Oil change	Maintenance	GarageX	Changed oil and filter	45200	2025-12-17 20:22:43.598908	2025-12-17 20:22:43.598908
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, role, created_at) FROM stdin;
1	alvin_dev	alvin@example.com	$2b$10$tkQdzUp8Je.Z0c0XRWG7aONC5B7QinB.r3wVJspyC8kn5nNvias92	user	2025-12-15 11:39:38.936102
4	admin	admin@vhp.ke	$2b$10$QL0rMJc1ZuGKn6GQbERZ.uskALUn/efh1Q5Zht5Cv8D5cublLpplq	admin	2025-12-16 14:15:47.506362
5	buyer	buyer@vhp.ke	$2b$10$Fkg/cC2agOkIyrsFH6WOYeUnO0pgFWmCiCW46/4Lp6RimdM7AxFPy	buyer	2025-12-16 14:15:47.787454
6	garage	garage@vhp.ke	$2b$10$/8Cbx/YKq6iTA4q3kSQ7e.K6MWUlTVPnOynDD7EA1N.UYWFI4ZZRy	garage	2025-12-16 14:15:48.007642
\.


--
-- Name: accidents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.accidents_id_seq', 2, true);


--
-- Name: cars_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cars_id_seq', 6, true);


--
-- Name: ownership_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ownership_history_id_seq', 1, true);


--
-- Name: ownerships_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ownerships_id_seq', 6, true);


--
-- Name: report_views_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.report_views_id_seq', 1, false);


--
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.services_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 9, true);


--
-- Name: accidents accidents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accidents
    ADD CONSTRAINT accidents_pkey PRIMARY KEY (id);


--
-- Name: cars cars_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cars
    ADD CONSTRAINT cars_pkey PRIMARY KEY (id);


--
-- Name: cars cars_plate_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cars
    ADD CONSTRAINT cars_plate_key UNIQUE (plate);


--
-- Name: cars cars_vin_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cars
    ADD CONSTRAINT cars_vin_key UNIQUE (vin);


--
-- Name: ownership_history ownership_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ownership_history
    ADD CONSTRAINT ownership_history_pkey PRIMARY KEY (id);


--
-- Name: ownerships ownerships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ownerships
    ADD CONSTRAINT ownerships_pkey PRIMARY KEY (id);


--
-- Name: report_views report_views_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_views
    ADD CONSTRAINT report_views_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: ownerships unique_car_owner; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ownerships
    ADD CONSTRAINT unique_car_owner UNIQUE (car_id, owner_name);


--
-- Name: services unique_car_service; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT unique_car_service UNIQUE (car_id, service_date, service_center);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: cars cars_set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER cars_set_updated_at BEFORE UPDATE ON public.cars FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: cars mileage_increase_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER mileage_increase_trigger BEFORE UPDATE OF mileage ON public.cars FOR EACH ROW EXECUTE FUNCTION public.check_mileage_increase();


--
-- Name: ownerships ownerships_set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER ownerships_set_updated_at BEFORE UPDATE ON public.ownerships FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: services services_set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER services_set_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: accidents accidents_car_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accidents
    ADD CONSTRAINT accidents_car_id_fkey FOREIGN KEY (car_id) REFERENCES public.cars(id) ON DELETE CASCADE;


--
-- Name: ownership_history ownership_history_car_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ownership_history
    ADD CONSTRAINT ownership_history_car_id_fkey FOREIGN KEY (car_id) REFERENCES public.cars(id);


--
-- Name: ownerships ownerships_car_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ownerships
    ADD CONSTRAINT ownerships_car_id_fkey FOREIGN KEY (car_id) REFERENCES public.cars(id) ON DELETE CASCADE;


--
-- Name: report_views report_views_car_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_views
    ADD CONSTRAINT report_views_car_id_fkey FOREIGN KEY (car_id) REFERENCES public.cars(id);


--
-- Name: report_views report_views_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_views
    ADD CONSTRAINT report_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: services services_car_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_car_id_fkey FOREIGN KEY (car_id) REFERENCES public.cars(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict T2qAbnCoaelCFMKKGGteOqJ4SSI2bwNFjT9UPOZ2PWw7Tt50upTn41sb5HWg1hn

