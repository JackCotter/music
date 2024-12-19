--
-- PostgreSQL database dump
--

-- Dumped from database version 16.0
-- Dumped by pg_dump version 16.0


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: blob_storage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blob_storage (
    blobid integer NOT NULL,
    blob_data bytea
);


-- ALTER TABLE public.blob_storage OWNER TO $POSTGRES_USER;

--
-- Name: blob_storage_blobid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.blob_storage_blobid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.blob_storage_blobid_seq OWNER TO $POSTGRES_USER;

--
-- Name: blob_storage_blobid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.blob_storage_blobid_seq OWNED BY public.blob_storage.blobid;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    owner character varying(100),
    projectid bigint NOT NULL,
    projectname character varying(100),
    lookingfor text[],
    lookingforstrict boolean,
    description character varying(1000),
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


-- ALTER TABLE public.projects OWNER TO $POSTGRES_USER;

--
-- Name: projects_projectid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.projects_projectid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.projects_projectid_seq OWNER TO $POSTGRES_USER;

--
-- Name: projects_projectid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.projects_projectid_seq OWNED BY public.projects.projectid;


--
-- Name: projecttracks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projecttracks (
    projectid integer NOT NULL,
    trackid integer NOT NULL,
    accepted boolean,
    projecttrackid bigint NOT NULL
);


-- ALTER TABLE public.projecttracks OWNER TO $POSTGRES_USER;

--
-- Name: projecttracks_projecttrackid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.projecttracks_projecttrackid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.projecttracks_projecttrackid_seq OWNER TO $POSTGRES_USER;

--
-- Name: projecttracks_projecttrackid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.projecttracks_projecttrackid_seq OWNED BY public.projecttracks.projecttrackid;


--
-- Name: tracks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tracks (
    instrumenttype character varying(50),
    trackid bigint NOT NULL,
    contributeremail character varying(100) NOT NULL,
    blobid integer,
    recording_offset real DEFAULT 0.0,
    title character varying(30),
    description character varying(300),
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


-- ALTER TABLE public.tracks OWNER TO $POSTGRES_USER;

--
-- Name: tracks_trackid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tracks_trackid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER SEQUENCE public.tracks_trackid_seq OWNER TO $POSTGRES_USER;

--
-- Name: tracks_trackid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tracks_trackid_seq OWNED BY public.tracks.trackid;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    email character varying(100) NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(200) NOT NULL,
    description character varying(300)
);


-- ALTER TABLE public.users OWNER TO $POSTGRES_USER;

--
-- Name: blob_storage blobid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blob_storage ALTER COLUMN blobid SET DEFAULT nextval('public.blob_storage_blobid_seq'::regclass);


--
-- Name: projects projectid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects ALTER COLUMN projectid SET DEFAULT nextval('public.projects_projectid_seq'::regclass);


--
-- Name: projecttracks projecttrackid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projecttracks ALTER COLUMN projecttrackid SET DEFAULT nextval('public.projecttracks_projecttrackid_seq'::regclass);


--
-- Name: tracks trackid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tracks ALTER COLUMN trackid SET DEFAULT nextval('public.tracks_trackid_seq'::regclass);


--
-- Name: blob_storage blob_storage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blob_storage
    ADD CONSTRAINT blob_storage_pkey PRIMARY KEY (blobid);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (projectid);


--
-- Name: tracks tracks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT tracks_pkey PRIMARY KEY (trackid);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (email);


--
-- PostgreSQL database dump complete
--

