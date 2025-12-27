
from __future__ import annotations

import os
import re
import smtplib
import hashlib
import secrets
import logging
import concurrent.futures
import unicodedata
from datetime import datetime, timedelta, timezone, date
from email.mime.text import MIMEText
from pathlib import Path
from typing import Dict, Any, Optional, Tuple

from pymongo import MongoClient, ASCENDING
from bson import ObjectId

from dotenv import load_dotenv
load_dotenv()

FASTAPI_HOST = os.getenv("FASTAPI_HOST", "0.0.0.0")
FASTAPI_PORT = int(os.getenv("FASTAPI_PORT", "8000"))

USERS_MONGODB_URI = os.getenv("USERS_MONGODB_URI", "")
SUBS_MONGODB_URI = os.getenv("SUBS_MONGODB_URI", "")

USERS_DB_NAME = os.getenv("USERS_DB_NAME", "users_db")
SUBS_DB_NAME = os.getenv("SUBS_DB_NAME", "subs_db")

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "0") or 0)
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL") or SMTP_USER or None

def get_logger() -> logging.Logger:
    log_dir = Path(__file__).resolve().parent / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d")
    logfile = log_dir / f"app_{ts}.log"

    logger = logging.getLogger("app")
    logger.setLevel(logging.INFO)

    if not logger.handlers:
        fh = logging.FileHandler(logfile, encoding="utf-8")
        ch = logging.StreamHandler()
        fmt = logging.Formatter("%(asctime)s - %(levelname)s - %(name)s - %(message)s")
        fh.setFormatter(fmt)
        ch.setFormatter(fmt)
        logger.addHandler(fh)
        logger.addHandler(ch)

    return logger

log = get_logger()

_users_client = MongoClient(USERS_MONGODB_URI, tz_aware=True, tzinfo=timezone.utc) if USERS_MONGODB_URI else None
_subs_client = MongoClient(SUBS_MONGODB_URI, tz_aware=True, tzinfo=timezone.utc) if SUBS_MONGODB_URI else None

users_db = _users_client[USERS_DB_NAME] if _users_client else None
subs_db = _subs_client[SUBS_DB_NAME] if _subs_client else None

EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$")
PHONE_RE = re.compile(r"^[0-9+\-() ]{6,20}$")


def validate_name(v: str) -> Tuple[bool, str]:
    if not isinstance(v, str) or not (2 <= len(v.strip()) <= 100):
        return False, "Name must be 2-100 characters."
    return True, ""


def validate_email(v: str) -> Tuple[bool, str]:
    if not isinstance(v, str) or not EMAIL_RE.match(v.strip()):
        return False, "Invalid email format."
    return True, ""


def validate_phone(v: str) -> Tuple[bool, str]:
    if not isinstance(v, str) or not PHONE_RE.match(v.strip()):
        return False, "Invalid phone format."
    return True, ""


def validate_password(v: str) -> Tuple[bool, str]:
    if not isinstance(v, str) or len(v) < 8:
        return False, "Password must be at least 8 characters."
    return True, ""


def validate_plan(v: str) -> Tuple[bool, str]:
    if not isinstance(v, str) or not (3 <= len(v) <= 20):
        return False, "Plan id must be 3-20 characters."
    return True, ""


def validate_dob(v: Optional[str], min_age: Optional[int] = None) -> Tuple[bool, str]:
    if v is None or v == "":
        return True, ""
    try:
        if isinstance(v, date) and not isinstance(v, datetime):
            dob_dt = datetime(v.year, v.month, v.day, tzinfo=timezone.utc)
        elif isinstance(v, datetime):
            dob_dt = v if v.tzinfo else v.replace(tzinfo=timezone.utc)
        else:
            dob_dt = datetime.strptime(str(v), "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except Exception:
        return False, "Date of birth must be in YYYY-MM-DD format."
    now = datetime.now(timezone.utc)
    if dob_dt > now:
        return False, "Date of birth cannot be in the future."
    if min_age is not None:
        today_local = now.date()
        dob_date = dob_dt.date()
        years = today_local.year - dob_date.year - (
            (today_local.month, today_local.day) < (dob_date.month, dob_date.day)
        )
        if years < min_age:
            return False, f"User must be at least {min_age} years old."
    return True, ""


def validate_height_m(v: Optional[float]) -> Tuple[bool, str]:
    if v is None:
        return True, ""
    if not (0.3 <= v <= 2.5):
        return False, "Height must be in meters."
    return True, ""


def validate_weight_kg(v: Optional[float]) -> Tuple[bool, str]:
    if v is None:
        return True, ""
    if not (1 <= v <= 400):
        return False, "Weight must be in kg."
    return True, ""


def compute_bmi(height_m: Optional[float], weight_kg: Optional[float]) -> Optional[float]:
    try:
        if not height_m or not weight_kg:
            return None
        if height_m <= 0 or weight_kg <= 0:
            return None
        bmi = weight_kg / (height_m * height_m)
        return round(bmi, 1)
    except Exception:
        return None




def compute_age_and_group(dob_iso: Optional[str]) -> Tuple[Optional[int], str]:
    if not dob_iso:
        return None, "unknown"
    try:
        dob_dt = datetime.strptime(str(dob_iso), "%Y-%m-%d").date()
    except Exception:
        return None, "unknown"
    today = datetime.now(timezone.utc).date()
    if dob_dt > today:
        return None, "unknown"
    years = today.year - dob_dt.year - ((today.month, today.day) < (dob_dt.month, dob_dt.day))
    if years <= 2:
        grp = "infant"
    elif 3 <= years <= 12:
        grp = "child"
    elif 13 <= years <= 17:
        grp = "teen"
    elif 18 <= years <= 59:
        grp = "adult"
    elif years >= 60:
        grp = "senior"
    else:
        grp = "unknown"
    return years, grp


_executor = concurrent.futures.ThreadPoolExecutor(max_workers=4)


def _send_email_blocking(to_addr: str, subject: str, body: str) -> None:
    if not (SMTP_HOST and SMTP_USER and SMTP_PASS and SMTP_PORT):
        log.info("SMTP not configured; printing email\nTo: %s\nSubject: %s\n%s", to_addr, subject, body)
        return
    try:
        msg = MIMEText(body, "plain", "utf-8")
        msg["From"] = SMTP_USER
        msg["To"] = to_addr
        msg["Subject"] = subject
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
        log.info("Email sent to %s subject='%s'", to_addr, subject)
    except Exception as e:
        log.error("Failed to send email to %s: %s", to_addr, e)
        # fallback to printing
        print(f"[EMAIL FALLBACK]\nTo: {to_addr}\nSubject: {subject}\n{body}")


def send_email(to_addr: str, subject: str, body: str) -> None:
    if not (SMTP_HOST and SMTP_USER and SMTP_PASS and SMTP_PORT):
        log.info("SMTP not configured; printing email\nTo: %s\nSubject: %s\n%s", to_addr, subject, body)
        return
    try:
        _executor.submit(_send_email_blocking, to_addr, subject, body)
        log.info("Email scheduled to %s subject='%s'", to_addr, subject)
    except Exception as e:
        log.error("Failed to schedule email: %s", e)
        _send_email_blocking(to_addr, subject, body)


def _salted_hash(pw: str, salt: Optional[str] = None) -> Tuple[str, str]:
    salt = salt or secrets.token_hex(16)
    h = hashlib.sha256((salt + pw).encode("utf-8")).hexdigest()
    return h, salt


def _today() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


# ------------------ Billing config ------------------
# Base monthly prices (these are base monthly amounts, editable)
BASE_MONTHLY_PRICES: Dict[str, float] = {
    "free": 300.0,
    "basic": 500.0,
    "pro": 800.0,
}

# Discount percentages to apply (0-100). Use mild numbers here.
DISCOUNT_PERCENTAGES: Dict[str, float] = {
    "quarterly": 10.0,  # percent off the total quarterly price (3x monthly)
    "yearly": 25.0,     # percent off the total yearly price (12x monthly)
}

# Durations in days for cycles; change if you'd prefer exact months
CYCLE_DURATIONS_DAYS: Dict[str, int] = {
    "monthly": 30,
    "quarterly": 90,
    "yearly": 365,
}


def compute_price_for_cycle(plan_id: str, cycle: str) -> Dict[str, Any]:
    """
    Compute final price for plan_id and billing cycle.
    Returns a dict: {"plan_id","cycle","base_monthly","multiplier","raw_total","discount_pct","discount_amount","final_price"}
    discount_pct is returned as a percent (e.g., 10.0 for 10%).
    """
    plan_id = (plan_id or "").strip()
    cycle = (cycle or "monthly").strip().lower()
    base = float(BASE_MONTHLY_PRICES.get(plan_id, BASE_MONTHLY_PRICES.get("free", 0.0)))
    if cycle == "monthly":
        mult = 1
        discount_pct = 0.0
    elif cycle == "quarterly":
        mult = 3
        discount_pct = float(DISCOUNT_PERCENTAGES.get("quarterly", 0.0))
    elif cycle == "yearly":
        mult = 12
        discount_pct = float(DISCOUNT_PERCENTAGES.get("yearly", 0.0))
    else:
        # fallback to monthly
        mult = 1
        discount_pct = 0.0
    raw = base * mult
    discount_amount = raw * (discount_pct / 100.0)
    final = round(raw - discount_amount, 2)
    return {
        "plan_id": plan_id,
        "cycle": cycle,
        "base_monthly": base,
        "multiplier": mult,
        "raw_total": raw,
        "discount_pct": discount_pct,
        "discount_amount": round(discount_amount, 2),
        "final_price": final,
    }


def bootstrap_databases() -> None:
    if users_db is None or subs_db is None:
        log.warning("DB URIs not configured. Skipping bootstrap.")
        return

    users_db.users.create_index([("email", ASCENDING)], unique=True, sparse=True)
    users_db.users.create_index([("phone", ASCENDING)], unique=True, sparse=True)
    users_db.verify_tokens.create_index([("email", ASCENDING), ("token", ASCENDING)], unique=True)
    users_db.verify_tokens.create_index([("expires_at", ASCENDING)])
    users_db.password_resets.create_index([("email", ASCENDING), ("token", ASCENDING)], unique=True)
    users_db.password_resets.create_index([("expires_at", ASCENDING)])
    log.info("DB_INIT: users db ready")

    subs_db.plans.create_index([("plan_id", ASCENDING)], unique=True)
    subs_db.subscriptions.create_index([("user_id", ASCENDING)], unique=True)
    subs_db.usage.create_index([("user_id", ASCENDING), ("date", ASCENDING)], unique=True)

    # Seed plan metadata (including base monthly price and usage_limit)
    if subs_db.plans.count_documents({}) == 0:
        subs_db.plans.insert_many([
            {
                "plan_id": "free",
                "name": "Free",
                "price": BASE_MONTHLY_PRICES["free"],
                "usage_limit": 3,
                "features": ["login", "image", "report"],
            },
            {
                "plan_id": "basic",
                "name": "Basic",
                "price": BASE_MONTHLY_PRICES["basic"],
                "usage_limit": 10,
                "features": ["login", "image", "report"],
            },
            {
                "plan_id": "pro",
                "name": "Pro",
                "price": BASE_MONTHLY_PRICES["pro"],
                "usage_limit": 100,
                "features": ["login", "image", "report"],
            },
        ])

        # subs_db.plans.insert_many([
        #     {"plan_id": "free",  "name": "Free",  "price": BASE_MONTHLY_PRICES["free"],  "usage_limit": 3,   "features": ["login", "image_basic"]},
        #     {"plan_id": "basic", "name": "Basic", "price": BASE_MONTHLY_PRICES["basic"], "usage_limit": 10,  "features": ["login", "image_basic", "report_basic"]},
        #     {"plan_id": "pro",   "name": "Pro",   "price": BASE_MONTHLY_PRICES["pro"],   "usage_limit": 100, "features": ["login", "image_advanced", "report_basic"]},
        # ])
    log.info("DB_INIT: subscription plans seeded")


_ZERO_WIDTH_RE = re.compile(r"[\u200B-\u200D\uFEFF]")


def _clean_token(t: str) -> str:
    if t is None:
        return ""
    s = unicodedata.normalize("NFKC", str(t))
    s = s.strip()
    s = _ZERO_WIDTH_RE.sub("", s)
    return s


def _human_dt(dt: Optional[datetime]) -> str:
    if not dt:
        return ""
    try:
        # show in ISO with timezone name when possible
        return dt.astimezone(timezone.utc).strftime("%Y-%m-%d %H:%M:%S %Z")
    except Exception:
        try:
            return dt.isoformat()
        except Exception:
            return str(dt)


def build_transaction_invoice_text(txn: Dict[str, Any], user_profile: Optional[Dict[str, Any]] = None) -> str:
    """
    Build a human-friendly plain-text invoice from transaction record.
    Expected txn keys:
      - transaction_id, user_id, plan_id, billing_cycle, unit_price, months,
        gross_amount, discount_pct (decimal e.g. 0.10) or percent (10.0) depending on origin,
        price (final), paid (bool), start_date, expires_at, created_at
    """
    lines = []
    lines.append("INVOICE / TRANSACTION")
    lines.append("=" * 48)
    lines.append(f"Invoice #: {txn.get('transaction_id')}")
    created_at = txn.get("created_at") or datetime.now(timezone.utc)
    lines.append(f"Date: {_human_dt(created_at)}")
    lines.append("-" * 48)

    if user_profile:
        name = user_profile.get("name") or user_profile.get("full_name") or ""
        email_addr = user_profile.get("email") or ""
        lines.append("BILL TO:")
        lines.append(f"  {name} <{email_addr}>")
        lines.append("-" * 48)

    lines.append("DETAILS")
    lines.append(f"  Plan: {txn.get('plan_id')}")
    lines.append(f"  Billing cycle: {txn.get('billing_cycle')}")
    if txn.get("unit_price") is not None:
        lines.append(f"  Unit price (per month): {float(txn.get('unit_price')):.2f}")
    if txn.get("months"):
        lines.append(f"  Duration: {int(txn.get('months'))} month(s)")
    lines.append(f"  Gross amount: {float(txn.get('gross_amount') or 0):.2f}")

    # discount_pct in txn might be decimal (0.10) or percent (10.0) depending on how txn was created.
    disc_raw = float(txn.get("discount_pct") or 0.0)
    if disc_raw <= 1.0:
        # treat as decimal
        disc_pct_for_print = disc_raw * 100.0
    else:
        disc_pct_for_print = disc_raw
    lines.append(f"  Discount: {disc_pct_for_print:.1f}%")
    lines.append(f"  Final amount: {float(txn.get('price') or 0):.2f}")
    lines.append(f"  Paid: {'Yes' if txn.get('paid') else 'No'}")
    lines.append("-" * 48)

    sd = txn.get("start_date")
    ex = txn.get("expires_at")
    if sd or ex:
        lines.append("Valid period:")
        if sd:
            lines.append(f"  From: {_human_dt(sd)}")
        if ex:
            lines.append(f"  Until: {_human_dt(ex)}")
        lines.append("-" * 48)

    lines.append("Thank you for your purchase.")
    return "\n".join(lines)


def send_transaction_invoice(txn: Dict[str, Any], user_id: Optional[str] = None) -> None:
    """
    Send invoice to the user (if email available) and to admin.
    Asynchronous best-effort; logs failures.
    """
    user_profile = None
    try:
        if user_id and users_db is not None:
            try:
                urec = users_db.users.find_one({"_id": ObjectId(user_id)})
                if urec:
                    user_profile = {"name": urec.get("name"), "email": urec.get("email")}
            except Exception as e:
                log.warning("send_transaction_invoice: user lookup failed: %s", e)
    except Exception:
        user_profile = None

    body = build_transaction_invoice_text(txn, user_profile=user_profile)
    subject = f"Invoice: {txn.get('transaction_id')} — {txn.get('plan_id')}"
    # send to user
    try:
        if user_profile and user_profile.get("email"):
            send_email(user_profile["email"], subject, body)
        else:
            log.info("No user email found for invoice %s", txn.get("transaction_id"))
    except Exception as e:
        log.error("Failed to send invoice to user: %s", e)
    # send to admin
    try:
        if ADMIN_EMAIL:
            send_email(ADMIN_EMAIL, f"[ADMIN COPY] {subject}", body)
        else:
            log.info("No ADMIN_EMAIL configured; skipping admin invoice.")
    except Exception as e:
        log.error("Failed to send invoice to admin: %s", e)


# ------------------ Public helper: create 1-day free trial ------------------
def create_one_day_free_trial_for_user(user_id: str, note: Optional[str] = "1-day free trial on signup") -> None:
    """
    Create/overwrite a subscription entry for `user_id` giving the FREE plan for 1 day.
    Also inserts a transaction (price 0) and attempts to send an invoice/notification email.
    Best-effort — logs failures but doesn't raise.
    """
    try:
        now = datetime.now(timezone.utc).replace(microsecond=0)
        starts_at = now
        ends_at = now + timedelta(days=1)

        if subs_db is None:
            log.warning("subs_db not configured — cannot create free trial record.")
            return

        # write subscription doc (free trial)
        subs_db.subscriptions.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "user_id": user_id,
                    "plan_id": "free",
                    "billing_cycle": "trial",
                    "price_paid": 0.0,
                    "paid": False,
                    "paid_successful": False,
                    "starts_at": starts_at,
                    "expires_at": ends_at,
                    "updated_at": now,
                    "trial": True,
                    "trial_days": 1,
                    "note": note,
                }
            },
            upsert=True,
        )

        # insert a transaction record (price 0)
        txn_id = secrets.token_urlsafe(8)
        txn = {
            "transaction_id": txn_id,
            "user_id": user_id,
            "plan_id": "free",
            "billing_cycle": "trial",
            "unit_price": 0.0,
            "months": 0,
            "gross_amount": 0.0,
            "discount_pct": 0.0,
            "discount_amount": 0.0,
            "price": 0.0,
            "paid": False,
            "start_date": starts_at,
            "expires_at": ends_at,
            "created_at": now,
            "note": note,
        }
        try:
            subs_db.transactions.insert_one(txn)
        except Exception as e:
            log.warning("Failed to insert free-trial transaction: %s", e)

        try:
            subs_db.admin_transactions.insert_one(txn)
        except Exception as e:
            log.warning("Failed to insert free-trial admin transaction: %s", e)

        # send invoice email (best-effort)
        try:
            send_transaction_invoice(txn, user_id=user_id)
        except Exception as e:
            log.warning("Failed to send free-trial invoice via helper: %s", e)
            # fallback: send simple email
            try:
                if users_db is not None:
                    urec = users_db.users.find_one({"_id": ObjectId(user_id)})
                    if urec and urec.get("email"):
                        email_to = urec.get("email")
                        subject = "Welcome — 1 day Free Trial Activated"
                        body = (
                            f"Hello {urec.get('name')},\n\n"
                            "Thanks for signing up. We've activated a 1-day free trial on the Free plan for your account.\n\n"
                            f"Valid until: {ends_at.isoformat()}\n\n"
                            "Enjoy!\n"
                        )
                        send_email(email_to, subject, body)
            except Exception as e2:
                log.warning("Failed to send fallback free-trial email: %s", e2)

        log.info("Created 1-day free trial for user %s (expires_at=%s)", user_id, ends_at.isoformat())
    except Exception as e:
        log.error("Error creating 1-day free trial for %s: %s", user_id, e)


# ------------------ User / auth / subscription functions ------------------
# def create_user(
#     full_name: str,
#     email: str,
#     phone: str,
#     password: str,
#     gender: Optional[str] = None,
#     country: Optional[str] = None,
#     state: Optional[str] = None,
#     language: Optional[str] = None,
#     user_type: Optional[str] = None,
#     dob: Optional[str] = None,
# ) -> Dict[str, Any]:
#     ok, msg = validate_name(full_name)
#     assert ok, msg
#     ok, msg = validate_email(email)
#     assert ok, msg
#     ok, msg = validate_phone(phone)
#     assert ok, msg
#     ok, msg = validate_password(password)
#     assert ok, msg

#     ok, msg = validate_dob(dob, min_age=None)
#     assert ok, msg

#     age_val, age_group = compute_age_and_group(dob)

#     if users_db is None:
#         raise RuntimeError("Users DB not configured")

#     pw_hash, salt = _salted_hash(password)
#     doc = {
#         "name": full_name.strip(),
#         "email": email.strip().lower(),
#         "phone": phone.strip(),
#         "password_hash": pw_hash,
#         "salt": salt,
#         "verified": False,
#         "created_at": datetime.now(timezone.utc),
#         "gender": gender,
#         "country": country,
#         "state": state,
#         "language": language,
#         "user_type": user_type,
#         "dob": dob,
#         "age": age_val,
#         "age_group": age_group,
#     }
#     res = users_db.users.insert_one(doc)
#     user_id = str(res.inserted_id)
#     log.info("sign_up -> user created %s", user_id)

#     token = secrets.token_urlsafe(24)
#     users_db.verify_tokens.update_one(
#         {"email": doc["email"]},
#         {
#             "$set": {
#                 "email": doc["email"],
#                 "token": token,
#                 "expires_at": datetime.now(timezone.utc) + timedelta(minutes=15),
#             }
#         },
#         upsert=True,
#     )
#     send_email(
#         doc["email"],
#         "Verify your account",
#         f"Hello {doc['name']},\n\nYour verification code is:\n\n{token}\n\nThis code expires in 15 minutes.",
#     )
#     return {"id": user_id, "name": doc["name"], "email": doc["email"], "phone": doc["phone"], "age_group": age_group, "age": age_val}

def create_user(
    full_name: str,
    email: str,
    phone: str,
    password: str,
    gender: Optional[str] = None,
    country: Optional[str] = None,
    state: Optional[str] = None,
    language: Optional[str] = None,
    user_type: Optional[str] = None,
    dob: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Creates a new user document.
    Responsibilities:
      - Validate inputs
      - Compute age & age_group from DOB
      - Store core identity + demographic fields
      - Issue verification token
    DOES NOT:
      - Compute BMI
      - Store height/weight/allergies/blood group
    """

    # ------------------ Validations ------------------
    ok, msg = validate_name(full_name)
    assert ok, msg

    ok, msg = validate_email(email)
    assert ok, msg

    ok, msg = validate_phone(phone)
    assert ok, msg

    ok, msg = validate_password(password)
    assert ok, msg

    ok, msg = validate_dob(dob, min_age=None)
    assert ok, msg

    # ------------------ Derived fields ------------------
    age_val, age_group = compute_age_and_group(dob)

    if users_db is None:
        raise RuntimeError("Users DB not configured")

    # ------------------ Password hashing ------------------
    pw_hash, salt = _salted_hash(password)

    # ------------------ User document ------------------
    doc = {
        "name": full_name.strip(),
        "email": email.strip().lower(),
        "phone": phone.strip(),

        "password_hash": pw_hash,
        "salt": salt,

        "verified": False,
        "created_at": datetime.now(timezone.utc),

        # Demographics
        "gender": gender,
        "country": country,
        "state": state,
        "language": language,
        "user_type": user_type,

        # DOB-derived
        "dob": dob,
        "age": age_val,
        "age_group": age_group,

        # Profile-completion fields (filled later)
        "blood_group": None,
        "height_m": None,
        "weight_kg": None,
        "bmi": None,
        "allergies": None,

        "profile_completed_at": None,
    }

    # ------------------ Insert user ------------------
    res = users_db.users.insert_one(doc)
    user_id = str(res.inserted_id)

    log.info("SIGN_UP: user created id=%s email=%s", user_id, doc["email"])

    # ------------------ Verification token ------------------
    token = secrets.token_urlsafe(24)

    users_db.verify_tokens.update_one(
        {"email": doc["email"]},
        {
            "$set": {
                "email": doc["email"],
                "token": token,
                "expires_at": datetime.now(timezone.utc) + timedelta(minutes=15),
            }
        },
        upsert=True,
    )

    # ------------------ Send verification email ------------------
    send_email(
        doc["email"],
        "Verify your account",
        (
            f"Hello {doc['name']},\n\n"
            f"Your verification code is:\n\n{token}\n\n"
            "This code expires in 15 minutes."
        ),
    )

    # ------------------ Return summary ------------------
    return {
        "id": user_id,
        "name": doc["name"],
        "email": doc["email"],
        "phone": doc["phone"],
        "age": age_val,
        "age_group": age_group,
    }



def consume_verify_token(email: str, token: str) -> bool:
    if users_db is None:
        log.info("consume_verify_token: users_db not configured")
        return False

    email_norm = (email or "").strip().lower()
    token_norm = (token or "").strip()

    if not email_norm or not token_norm:
        log.info("consume_verify_token: missing email or token (after normalize)")
        return False

    rec = users_db.verify_tokens.find_one({"email": email_norm, "token": token_norm})
    if not rec:
        log.info("consume_verify_token: NO MATCH email=%s token_len=%d", email_norm, len(token_norm))
        return False

    exp = rec.get("expires_at")
    exp = exp if getattr(exp, "tzinfo", None) else exp.replace(tzinfo=timezone.utc)
    if exp < datetime.now(timezone.utc):
        users_db.verify_tokens.delete_many({"email": email_norm})
        log.info("consume_verify_token: token expired for %s", email_norm)
        return False

    users_db.verify_tokens.delete_many({"email": email_norm})
    return True


def Login_Form_Verify_Account_Func(email: str, otp_code: str) -> Dict[str, Any]:
    email_norm = (email or "").strip().lower()
    otp_norm = (otp_code or "").strip()
    ok = consume_verify_token(email_norm, otp_norm)
    if not ok:
        return {"status": "error", "message": "Invalid or expired token."}
    users_db.users.update_one({"email": email_norm}, {"$set": {"verified": True}})
    log.info("user_registration -> verified %s", email_norm)
    return {"status": "success", "message": "Account verified."}


# def Login_Form_Login_User_Func(email_or_phone: str, password: str) -> Dict[str, Any]:
#     if users_db is None:
#         return {"status": "error", "message": "Users DB not configured"}

#     identifier = (email_or_phone or "").strip()
#     if "@" in identifier:
#         q = {"email": identifier.lower()}
#     else:
#         q = {"phone": identifier}

#     user = users_db.users.find_one(q)
#     if not user:
#         return {"status": "error", "message": "User not found."}

#     # Check password
#     h, _ = _salted_hash(password, user.get("salt"))
#     if h != user.get("password_hash"):
#         return {"status": "error", "message": "Invalid credentials."}

#     if not user.get("verified"):
#         return {
#             "status": "verification_required",
#             "email": user.get("email"),
#             "message": "Please verify your account.",
#         }

#     # record login usage
#     Login_Form_Record_Login_Func(str(user["_id"]))

#     # ensure age_group present (compute & persist if missing)
#     dob_stored = user.get("dob")
#     age_val = user.get("age")
#     age_grp = user.get("age_group")
#     if age_grp in (None, "unknown") or age_val is None:
#         a, g = compute_age_and_group(dob_stored)
#         age_val = a
#         age_grp = g
#         try:
#             users_db.users.update_one({"_id": user["_id"]}, {"$set": {"age": age_val, "age_group": age_grp}})
#         except Exception:
#             log.warning("Failed to persist computed age/age_group for user %s", str(user.get("_id")))

#     return {
#         "status": "success",
#         "message": "Login successful.",
#         "user": {
#             "id": str(user["_id"]),
#             "name": user.get("name"),
#             "email": user.get("email"),
#             "dob": dob_stored,
#             "age": age_val,
#             "age_group": age_grp,
#         },
#     }

def Login_Form_Login_User_Func(email_or_phone: str, password: str) -> Dict[str, Any]:
    """
    Authenticate user and return user profile snapshot.
    IMPORTANT:
      - This function MUST NOT compute or mutate profile data
      - Only reads existing fields from DB
    """

    if users_db is None:
        return {"status": "error", "message": "Users DB not configured"}

    identifier = (email_or_phone or "").strip()
    if not identifier:
        return {"status": "error", "message": "Missing email or phone."}

    # ------------------ Find user ------------------
    if "@" in identifier:
        q = {"email": identifier.lower()}
    else:
        q = {"phone": identifier}

    user = users_db.users.find_one(q)
    if not user:
        return {"status": "error", "message": "User not found."}

    # ------------------ Verify password ------------------
    h, _ = _salted_hash(password, user.get("salt"))
    if h != user.get("password_hash"):
        return {"status": "error", "message": "Invalid credentials."}

    # ------------------ Verification check ------------------
    if not user.get("verified", False):
        return {
            "status": "verification_required",
            "email": user.get("email"),
            "message": "Please verify your account.",
        }

    # ------------------ Record login usage ------------------
    try:
        Login_Form_Record_Login_Func(str(user["_id"]))
    except Exception as e:
        log.warning("Login usage record failed for user %s: %s", user.get("_id"), e)

    # ------------------ Return snapshot (NO mutation) ------------------
    return {
        "status": "success",
        "message": "Login successful.",
        "user": {
            "id": str(user["_id"]),
            "name": user.get("name"),
            "email": user.get("email"),
            "phone": user.get("phone"),

            # Demographics
            "gender": user.get("gender"),
            "country": user.get("country"),
            "state": user.get("state"),
            "language": user.get("language"),
            "user_type": user.get("user_type"),

            # DOB-derived (already stored)
            "dob": user.get("dob"),
            "age": user.get("age"),
            "age_group": user.get("age_group"),

            # Medical profile (read-only)
            "blood_group": user.get("blood_group"),
            "height_m": user.get("height_m"),
            "weight_kg": user.get("weight_kg"),
            "bmi": user.get("bmi"),

            "profile_completed_at": user.get("profile_completed_at"),
        },
    }



def Login_Form_Forgot_Password_Func(email: str, phone: str) -> Dict[str, Any]:
    ok, _ = validate_email(email)
    ok2, _ = validate_phone(phone)
    if not (ok and ok2):
        return {"status": "error", "message": "Invalid email/phone."}
    if users_db is None:
        return {"status": "error", "message": "Users DB not configured"}
    user = users_db.users.find_one({"email": email.lower(), "phone": phone})
    if not user:
        return {"status": "error", "message": "No matching account."}
    token = secrets.token_urlsafe(24)
    users_db.password_resets.update_one(
        {"email": email.lower()},
        {
            "$set": {
                "email": email.lower(),
                "token": token,
                "expires_at": datetime.now(timezone.utc) + timedelta(minutes=30),
            }
        },
        upsert=True,
    )
    send_email(email, "Password reset token", f"Your reset token is:\n\n{token}")
    log.info("forgot_password -> issued reset token for %s", email)
    return {"status": "success", "message": "Reset token sent."}


def Login_Form_Reset_Password_Func(email: str, reset_token: str, new_password: str) -> Dict[str, Any]:
    ok, msg = validate_password(new_password)
    if not ok:
        return {"status": "error", "message": msg}
    if users_db is None:
        return {"status": "error", "message": "Users DB not configured"}

    email_norm = (email or "").strip().lower()
    token_norm = _clean_token(reset_token)

    if not email_norm or not token_norm:
        return {"status": "error", "message": "Missing email or token."}

    rec = users_db.password_resets.find_one({"email": email_norm})
    if not rec:
        return {"status": "error", "message": "Invalid token."}

    db_token = _clean_token(rec.get("token", ""))
    if token_norm != db_token:
        return {"status": "error", "message": "Invalid token."}

    exp = rec["expires_at"]
    exp = exp if getattr(exp, "tzinfo", None) else exp.replace(tzinfo=timezone.utc)
    if exp < datetime.now(timezone.utc):
        users_db.password_resets.delete_one({"_id": rec["_id"]})
        return {"status": "error", "message": "Token expired."}

    pw_hash, salt = _salted_hash(new_password)
    users_db.users.update_one({"email": email_norm}, {"$set": {"password_hash": pw_hash, "salt": salt}})
    users_db.password_resets.delete_many({"email": email_norm})
    log.info("reset_password for %s", email_norm)
    return {"status": "success", "message": "Password reset successful."}


# def Login_Form_Register_User_Func(
#     full_name: str,
#     email: str,
#     phone: str,
#     password: str,
#     plan_id: str,
#     gender: Optional[str] = None,
#     country: Optional[str] = None,
#     state: Optional[str] = None,
#     language: Optional[str] = None,
#     user_type: Optional[str] = None,
#     dob: Optional[str] = None,
# ) -> Dict[str, Any]:
#     """
#     Register a user and return summary. This function now:
#       - creates the user document,
#       - issues verify token & email,
#       - does NOT assume a long subscription; server-side flow (lang_graph) will attach the 1-day free trial.
#     """
#     try:
#         user = create_user(
#             full_name,
#             email,
#             phone,
#             password,
#             gender=gender,
#             country=country,
#             state=state,
#             language=language,
#             user_type=user_type,
#             dob=dob,
#         )
#         # Don't set a full subscription here; the LangGraph sign_up node will call
#         # create_one_day_free_trial_for_user(user["id"]) so that the trial creation
#         # is part of the workflow and its logging.
#         return {
#             "status": "success",
#             "message": "Registration created, verify OTP.",
#             "user_id": user["id"],
#             "age": user.get("age"),
#             "age_group": user.get("age_group"),
#         }
#     except Exception as e:
#         msg = str(e)
#         if "E11000" in msg or "duplicate key" in msg:
#             return {"status": "error", "message": "Email or phone already registered."}
#         return {"status": "error", "message": msg}


# def Login_Form_Register_User_Func(
#     full_name: str,
#     email: str,
#     phone: str,
#     password: str,
#     plan_id: str,
#     gender: Optional[str] = None,
#     country: Optional[str] = None,
#     state: Optional[str] = None,
#     language: Optional[str] = None,
#     user_type: Optional[str] = None,
#     dob: Optional[str] = None,
#     blood_group: Optional[str] = None,
#     height: Optional[float] = None,
#     weight: Optional[float] = None,
#     allergies: Optional[str] = None,
# ) -> Dict[str, Any]:

#     """
#     Register a user and return a minimal summary.

#     Responsibilities:
#       - Create user document (DOB → age, age_group computed inside create_user)
#       - Issue verification token & email
#       - DO NOT create subscription (handled by LangGraph)
#       - DO NOT compute BMI or medical metrics
#     """

#     try:
#         user = create_user(
#             full_name=full_name,
#             email=email,
#             phone=phone,
#             password=password,
#             gender=gender,
#             country=country,
#             state=state,
#             language=language,
#             user_type=user_type,
#             dob=dob,
#         )

#         return {
#             "status": "success",
#             "message": "Registration created. Please verify OTP.",
#             "user_id": user["id"],

#             # Returned for UI / graph state only (already persisted)
#             "age": user.get("age"),
#             "age_group": user.get("age_group"),
#         }

#     except Exception as e:
#         msg = str(e)

#         # Duplicate key (email / phone)
#         if "E11000" in msg or "duplicate key" in msg:
#             return {
#                 "status": "error",
#                 "message": "Email or phone already registered.",
#             }

#         log.error("Registration failed: %s", msg)
#         return {
#             "status": "error",
#             "message": msg,
#         }



def Login_Form_Register_User_Func(
    full_name: str,
    email: str,
    phone: str,
    password: str,
    plan_id: str,
    gender: Optional[str] = None,
    country: Optional[str] = None,
    state: Optional[str] = None,
    language: Optional[str] = None,
    user_type: Optional[str] = None,
    dob: Optional[str] = None,
    blood_group: Optional[str] = None,
    height: Optional[float] = None,   # meters
    weight: Optional[float] = None,   # kg
    allergies: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Register a user and return summary.

    Responsibilities:
      - Create user (DOB → age, age_group computed inside create_user)
      - Persist medical/profile fields AFTER user creation
      - Compute BMI ONCE and store it
      - Issue verification token & email
      - DO NOT create subscription (LangGraph handles it)
    """
    user_created=False
    try:
        # ------------------ Create base user ------------------
        user = create_user(
            full_name=full_name,
            email=email,
            phone=phone,
            password=password,
            gender=gender,
            country=country,
            state=state,
            language=language,
            user_type=user_type,
            dob=dob,
        )

        user_id = user["id"]
        user_created=True

        # ------------------ Normalize height (cm → m) ------------------
        if height is not None and height > 3:
            height = height / 100.0

        # ------------------ Validate medical inputs ------------------
        ok_h, msg_h = validate_height_m(height)
        ok_w, msg_w = validate_weight_kg(weight)
        # ok_p, msg_p = validate_plan(plan_id)


        if not ok_h:
            raise ValueError(msg_h)
        if not ok_w:
            raise ValueError(msg_w)
        # if not ok_p:
        #     raise ValueError(msg_p)

        # ------------------ Compute BMI ------------------
        bmi = compute_bmi(height, weight)

        # ------------------ Persist profile completion ------------------
        if users_db is None:
            raise RuntimeError("Users DB not configured")

        users_db.users.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "blood_group": blood_group,
                    "height_m": height,
                    "weight_kg": weight,
                    "bmi": bmi,
                    "allergies": allergies,
                    "profile_completed_at": datetime.now(timezone.utc),
                }
            },
        )

        log.info(
            "SIGN_UP: profile completed for user=%s bmi=%s",
            user_id,
            bmi,
        )

        # ------------------ Return summary ------------------
        return {
            "status": "success",
            "message": "Registration created. Please verify OTP.",
            "user_id": user_id,
            "age": user.get("age"),
            "age_group": user.get("age_group"),
            "bmi": bmi,
        }

    except Exception as e:
        msg = str(e)

    # ------------------ Rollback user if partially created ------------------
        if user_created and not ("E11000" in msg or "duplicate key" in msg):
            try:
                users_db.users.delete_one({"_id": ObjectId(user_id)})
                users_db.verify_tokens.delete_many({"email": email.lower()})
                log.warning(
                     "SIGN_UP: rolled back user creation user_id=%s due to error",
                    user_id,
                )
            except Exception as rb_err:
                log.error(
                    "SIGN_UP: rollback failed for user %s: %s",
                    user_id,
                    rb_err,
                )

        if "E11000" in msg or "duplicate key" in msg:
            return {
                "status": "error",
                "message": "Email or phone already registered.",
            }
        log.error("Registration failed: %s", msg)
        return {
           "status": "error",
          "message": msg,
     }




def list_all_plans() -> Dict[str, Any]:
    if subs_db is None:
        return {"plans": []}
    plans = list(subs_db.plans.find({}, {"_id": 0}).sort("price", ASCENDING))
    return {"plans": plans}


def get_plan(pid: str) -> Optional[Dict[str, Any]]:
    if subs_db is None:
        return None
    return subs_db.plans.find_one({"plan_id": pid}, {"_id": 0})


def Login_Form_Get_User_Subscription_Func(user_id: str) -> Dict[str, Any]:
    if subs_db is None:
        return {
            "subscription": {
                "plan_id": "free",
                "plan_name": "Free",
                "price": BASE_MONTHLY_PRICES.get("free", 0),
                "usage_limit": 3,
                "features": ["login", "image_basic"],
            }
        }
    sub = subs_db.subscriptions.find_one({"user_id": user_id})
    if not sub:
        plan = get_plan("free") or {
            "plan_id": "free",
            "name": "Free",
            "price": BASE_MONTHLY_PRICES.get("free", 0),
            "usage_limit": 3,
            "features": ["login", "image_basic"],
        }
        return {
            "subscription": {
                "plan_id": plan["plan_id"],
                "plan_name": plan["name"],
                "price": plan.get("price", 0),
                "usage_limit": plan.get("usage_limit", 0),
                "features": plan.get("features", []),
                "paid": False,
            }
        }
    plan = get_plan(sub.get("plan_id", "free")) or get_plan("free")
    # include the subscription document fields (paid, billing_cycle, starts_at, ends_at) if present
    out = {
        "plan_id": plan["plan_id"],
        "plan_name": plan["name"],
        "price": sub.get("price_paid", plan.get("price")),
        "usage_limit": plan.get("usage_limit", 0),
        "features": plan.get("features", []),
        "paid": bool(sub.get("paid", False)),
        "billing_cycle": sub.get("billing_cycle"),
        "starts_at": sub.get("starts_at"),
        "ends_at": sub.get("expires_at") or sub.get("ends_at"),
    }
    return {"subscription": out}


def Login_Form_Set_Subscription_Func(user_id: str, plan_id: str, billing_cycle: str = "monthly", paid: bool = False, price_paid: Optional[float] = None) -> Dict[str, Any]:
    """
    Set user's subscription in DB.
    If paid==True, compute starts_at/ends_at and store paid metadata.
    If paid==False, create a pending subscription entry (paid: False).
    Additionally records a transaction and sends an invoice email (best-effort).
    """
    if subs_db is None:
        raise ValueError("Subs DB not configured")
    plan = get_plan(plan_id)
    if not plan:
        raise ValueError("Invalid plan_id")

    billing_cycle = (billing_cycle or "monthly").strip().lower()
    now = datetime.now(timezone.utc).replace(microsecond=0)
    starts_at = now
    duration_days = CYCLE_DURATIONS_DAYS.get(billing_cycle, CYCLE_DURATIONS_DAYS["monthly"])
    ends_at = (now + timedelta(days=duration_days)).replace(microsecond=0)

    price_info = compute_price_for_cycle(plan_id, billing_cycle)
    multiplier = price_info.get("multiplier", 1)
    unit_price = price_info.get("base_monthly", float(plan.get("price", 0.0)))
    gross_amount = float(unit_price) * int(multiplier)
    discount_pct = float(price_info.get("discount_pct", 0.0)) / 100.0  # convert percent->decimal
    discount_amount = round(gross_amount * discount_pct, 2)
    final_price = float(price_paid) if price_paid is not None else float(price_info["final_price"])

    # Update subscription doc
    subs_db.subscriptions.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "user_id": user_id,
                "plan_id": plan_id,
                "billing_cycle": billing_cycle,
                "price_paid": final_price,
                "paid": bool(paid),
                "paid_successful": bool(paid),
                "starts_at": starts_at,
                "expires_at": ends_at,
                "updated_at": now,
            }
        },
        upsert=True,
    )
    log.info("subscription_plan -> set plan %s for user %s (paid=%s, cycle=%s, price=%s)", plan_id, user_id, paid, billing_cycle, final_price)

    # Create transaction records
    txn_id = secrets.token_urlsafe(8)
    txn = {
        "transaction_id": txn_id,
        "user_id": user_id,
        "plan_id": plan_id,
        "billing_cycle": billing_cycle,
        "unit_price": float(unit_price),
        "months": int(multiplier),
        "gross_amount": float(gross_amount),
        "discount_pct": float(discount_pct),
        "discount_amount": float(discount_amount),
        "price": float(final_price),
        "paid": bool(paid),
        "start_date": starts_at,
        "expires_at": ends_at,
        "created_at": now,
    }
    try:
        subs_db.transactions.insert_one(txn)
    except Exception as e:
        log.warning("Failed to insert user transaction: %s", e)

    # admin/global transaction (duplicate for admin view)
    try:
        subs_db.admin_transactions.insert_one(txn)
    except Exception as e:
        log.warning("Failed to insert admin transaction: %s", e)

    # send invoice email (best-effort)
    try:
        send_transaction_invoice(txn, user_id=user_id)
    except Exception as e:
        log.warning("Failed to send transaction invoice (best-effort): %s", e)

    return Login_Form_Get_User_Subscription_Func(user_id)


def Login_Form_Record_Login_Func(user_id: str) -> None:
    if subs_db is None:
        log.info("Skipping record_login: subs db not configured")
        return
    today = _today()
    subs_db.usage.update_one(
        {"user_id": user_id, "date": today},
        {"$inc": {"current_usage": 1}, "$setOnInsert": {"recent_activities": []}},
        upsert=True,
    )
    log.info("user_login_validation -> login counted for %s", user_id)


def Login_Form_Record_Activity_Func(user_id: str, feature: str) -> None:
    if subs_db is None:
        log.info("Skipping record_activity: subs db not configured")
        return
    today = _today()
    now = datetime.now(timezone.utc).isoformat()
    doc = subs_db.usage.find_one({"user_id": user_id, "date": today})
    acts = (doc or {}).get("recent_activities", [])
    acts.insert(0, {"feature": feature, "timestamp": now})
    acts = acts[:100]
    subs_db.usage.update_one(
        {"user_id": user_id, "date": today},
        {"$set": {"recent_activities": acts}},
        upsert=True,
    )
    log.info("feature used '%s' by %s", feature, user_id)


def get_user_usage(user_id: str) -> Dict[str, Any]:
    if subs_db is None:
        return {
            "usage": {
                "current_usage": 0,
                "period": "Today",
                "recent_activities": [],
            }
        }
    today = _today()
    doc = subs_db.usage.find_one({"user_id": user_id, "date": today}, {"_id": 0})
    if not doc:
        return {
            "usage": {
                "current_usage": 0,
                "period": "Today",
                "recent_activities": [],
            }
        }
    return {
        "usage": {
            "current_usage": doc.get("current_usage", 0),
            "period": "Today",
            "recent_activities": doc.get("recent_activities", []),
        }
    }

def get_patient_overview_graph(user_id: str) -> Dict[str, Any]:
    """
    Build a knowledge graph for patient overview.
    Returns:
      {
        "nodes": [...],
        "edges": [...]
      }
    """

    if users_db is None:
        raise RuntimeError("Users DB not configured")

    try:
        uid = ObjectId(user_id)
    except Exception:
        raise ValueError("Invalid user_id")

    user = users_db.users.find_one({"_id": uid})
    if not user:
        raise ValueError("User not found")

    nodes = []
    edges = []

    # ------------------ Core patient node ------------------
    nodes.append({
        "id": "patient",
        "label": "Patient",
        "type": "patient",
        "value": user.get("name"),
    })

    # ------------------ Attributes ------------------
    def add_attr(key, label, value):
        if value is not None:
            nid = key
            nodes.append({
                "id": nid,
                "label": label,
                "type": "attribute",
                "value": value,
            })
            edges.append({
                "source": "patient",
                "target": nid,
                "label": "has",
            })

    add_attr("age", "Age", user.get("age"))
    add_attr("gender", "Gender", user.get("gender"))
    add_attr("blood_group", "Blood Group", user.get("blood_group"))
    add_attr("bmi", "BMI", user.get("bmi"))
    add_attr("country", "Country", user.get("country"))
    add_attr("state", "State", user.get("state"))
    add_attr("language", "Language", user.get("language"))
    add_attr("height", "Height (m)", user.get("height_m"))
    add_attr("weight", "Weight (kg)", user.get("weight_kg"))
    add_attr("dob", "DOB", user.get("dob"))
    add_attr("age_group", "Age Group", user.get("age_group"))




    # ------------------ Allergies ------------------
    allergies = user.get("allergies")
    if allergies:
        for idx, allergy in enumerate(str(allergies).split(",")):
            aid = f"allergy_{idx}"
            nodes.append({
                "id": aid,
                "label": allergy.strip(),
                "type": "allergy",
            })
            edges.append({
                "source": "patient",
                "target": aid,
                "label": "allergic_to",
            })

    # ------------------ PLACEHOLDERS ------------------
    # Conditions, medications, reports should come from their own collections
    # Example:
    #
    # conditions = list(users_db.conditions.find({"user_id": user_id}))
    # for c in conditions:
    #   ...

    return {
        "nodes": nodes,
        "edges": edges,
    }



def Login_Form_Upgrade_Plan_Func(user_id: str, new_plan_id: str, paid: bool = False, billing_cycle: str = "monthly", price_paid: Optional[float] = None) -> Dict[str, Any]:
    """
    Upgrade helper — now delegates to Login_Form_Set_Subscription_Func and preserves paid flag.
    """
    try:
        resp = Login_Form_Set_Subscription_Func(user_id, new_plan_id, billing_cycle=billing_cycle, paid=paid, price_paid=price_paid)
        plan_name = resp["subscription"]["plan_name"]
        if users_db is not None:
            try:
                user = users_db.users.find_one({"_id": ObjectId(user_id)})
                if user and user.get("email"):
                    send_email(user["email"], "Plan upgraded", f"Your plan is now {plan_name}.")
            except Exception:
                log.info("Upgrade: couldn't lookup user email to send notification.")
        return {"status": "success", "message": f"Upgraded to {plan_name}.", "subscription": resp.get("subscription")}
    except Exception as e:
        log.error("Login_Form_Upgrade_Plan_Func failed: %s", e)
        return {"status": "error", "message": str(e)}


# def Login_Form_Use_Feature_Func(user_id: str, feature: str) -> Dict[str, Any]:
#     Login_Form_Record_Activity_Func(user_id, feature)
#     return {"status": "success", "message": f"Feature '{feature}' recorded."}


def Login_Form_Use_Feature_Func(user_id: str, feature: str) -> Dict[str, Any]:
    """
    Validates feature usage against subscription and usage limits.
    """

    if subs_db is None:
        return {"flag": "no", "message": "Subscription DB not configured"}

    # ------------------ Get subscription ------------------
    sub = subs_db.subscriptions.find_one({"user_id": user_id})
    plan_id = sub.get("plan_id", "free") if sub else "free"

    plan = get_plan(plan_id)
    if not plan:
        return {"flag": "no", "message": "Invalid subscription plan"}

    allowed_features = plan.get("features", [])
    usage_limit = plan.get("usage_limit", 0)

    # ------------------ Feature allowed? ------------------
    if feature not in allowed_features:
        return {
            "flag": "no",
            "message": f"'{feature}' feature not allowed for your plan",
        }

    # ------------------ Usage check ------------------
    today = _today()
    usage = subs_db.usage.find_one({"user_id": user_id, "date": today})
    current_usage = usage.get("current_usage", 0) if usage else 0

    if current_usage >= usage_limit:
        return {
            "flag": "no",
            "message": "Daily usage limit reached",
        }

    # ------------------ Record usage ------------------
    subs_db.usage.update_one(
        {"user_id": user_id, "date": today},
        {
            "$inc": {"current_usage": 1},
            "$push": {
                "recent_activities": {
                    "$each": [{
                        "feature": feature,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    }],
                    "$slice": -100,
                }
            },
        },
        upsert=True,
    )

    log.info("FEATURE_USED: user=%s feature=%s", user_id, feature)

    return {
        "flag": "yes",
        "feature": feature,
        "message": "Feature usage recorded",
    }
