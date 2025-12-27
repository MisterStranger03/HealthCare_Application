from __future__ import annotations

import time
from typing import Dict, Any
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, END

from app.functions import (
    log,
    Login_Form_Register_User_Func,
    Login_Form_Verify_Account_Func,
    Login_Form_Login_User_Func,
    Login_Form_Forgot_Password_Func,
    Login_Form_Reset_Password_Func,
    Login_Form_Get_User_Subscription_Func,
    Login_Form_Upgrade_Plan_Func,
    Login_Form_Use_Feature_Func,
    Login_Form_Set_Subscription_Func,
    users_db,
    subs_db,
    send_email,
    create_one_day_free_trial_for_user,
)
from datetime import datetime, timedelta, timezone
from bson import ObjectId
import secrets


class LoginFormState(TypedDict, total=False):
    start_at: str
    flag: str

    full_name: str
    email: str
    phone: str
    password: str
    plan_id: str

    gender: str
    country: str
    state: str
    language: str
    user_type: str
    dob: str
    age: int
    age_group: str
    blood_group: str
    height: float
    weight: float
    allergies: str

    status: str
    user_id: str
    message: str
    _from_signup: str

    otp_code: str
    registration_status: str
    _reg_ok: bool

    email_or_phone: str
    login_status: str
    user: Dict[str, Any]

    password_reset: str
    _reset_token_sent: bool
    _continue_after_forgot: str

    reset_token: str
    new_password: str
    reset_status: str
    _reset_ok: bool

    session: str

    subscription: str
    sub_detail: Dict[str, Any]

    new_plan_id: str
    subscription_status: str

    access: str

    selection: str

    task: str


def logfile(msg: str) -> None:
    log.info(msg)


def Login_Form_Start_Router_Node(state: Dict) -> Dict:
    """
    Args:
      - state: dict containing optional 'start_at' key
    Return:
      - dict: merges {'flag': 'yes'} with input state and normalized start_at
    """
    start_time = time.perf_counter()
    log.info("---START_ROUTER---")
    log.info(f"[DEBUG] Entering node Login_Form_Start_Router_Node with state: {state}")
    try:
        start_at = (state.get("start_at") or "sign_in").strip().lower()
        state["start_at"] = start_at
        logfile(f"START_ROUTER: start_at={start_at}")
        return {"flag": "yes", **state}
    finally:
        end_time = time.perf_counter()
        log.info(f"Completed Login_Form_Start_Router_Node in {end_time - start_time:.2f} seconds")


def Login_Form_Sign_Up_Node(state: Dict) -> Dict:
    """
    Args:
      - state: dict with registration inputs (full_name,email,phone,password,plan_id and optional registration fields)
    Return:
      - dict: registration result fields including status, flag, user_id, message, _from_signup, email, dob, age, age_group
    Notes:
      - After successful registration, creates a 1-day free trial subscription record by calling
        create_one_day_free_trial_for_user(user_id). This is best-effort and logged.
    """
    start_time = time.perf_counter()
    log.info("---SIGN_UP---")
    log.info(f"[DEBUG] Entering node Login_Form_Sign_Up_Node with state: {state}")
    try:
        try:
            resp = Login_Form_Register_User_Func(
                full_name=state["full_name"],
                email=state["email"],
                phone=state["phone"],
                password=state["password"],
                plan_id=state.get("plan_id", "free"),
                gender=state.get("gender"),
                country=state.get("country"),
                state=state.get("state"),
                language=state.get("language"),
                user_type=state.get("user_type"),
                dob=state.get("dob"),
                blood_group=state.get("blood_group"),
                height=state.get("height"),
                weight=state.get("weight"),
                allergies=state.get("allergies"),
            )
            ok = resp.get("status") == "success"
            logfile("SIGN_UP: ok" if ok else "SIGN_UP: failed")
            out = {

                "status": "registered" if ok else "failed",
                "flag": "yes" if ok else "no",
                "user_id": resp.get("user_id"),
                "message": resp.get("message"),
                "_from_signup": "yes" if ok else "no",
                "email": state.get("email"),
                "dob": state.get("dob"),
                "age": resp.get("age"),
                "age_group": resp.get("age_group"),
                "bmi": resp.get("bmi"),

                
                # "status": "registered" if ok else "failed",
                # "flag": "yes" if ok else "no",
                # "user_id": resp.get("user_id"),
                # "message": resp.get("message"),
                # "_from_signup": "yes" if ok else "no",
                # "email": (state.get("email") or "").strip().lower(),
                # "dob": state.get("dob"),
                # "age": resp.get("age"),
                # "age_group": resp.get("age_group"),


                # "blood_group": state.get("blood_group"),
                # "height": state.get("height"),
                # "weight": state.get("weight"),
                # "allergies": state.get("allergies"),
            }

            #Free trial create if successful sign up
            if ok:
                try:
                    user_id = resp.get("user_id")
                    if user_id:
                        create_one_day_free_trial_for_user(user_id)
                        log.info("SIGN_UP: created 1-day free trial for user %s", user_id)
                    else:
                        log.warning("SIGN_UP: registration success but no user_id returned; cannot create trial")
                except Exception as e:
                    log.warning("SIGN_UP: failed to create free trial for user: %s", e)

            return out
        except Exception as e:
            logfile(f"SIGN_UP: {e}")
            return {"status": "failed", "flag": "no", "message": str(e)}
    finally:
        end_time = time.perf_counter()
        log.info(f"Completed Login_Form_Sign_Up_Node in {end_time - start_time:.2f} seconds")


def Login_Form_User_Registration_Node(state: Dict) -> Dict:
    """
    Args:
      - state: dict with 'flag' and 'email' and optional 'otp_code'
    Return:
      - dict: registration_status ('verified'|'failed'|'pending_verification'|'skipped'), flag, _reg_ok, message, email
    """
    start_time = time.perf_counter()
    log.info("---USER_REGISTRATION---")
    log.info(f"[DEBUG] Entering node Login_Form_User_Registration_Node with state: {state}")
    try:
        if state.get("flag") != "yes":
            logfile("USER_REGISTRATION: skipped")
            return {"registration_status": "skipped", "flag": "no", "_reg_ok": False}
        try:
            email = (state.get("email") or "").strip().lower()
            otp = (state.get("otp_code") or "").strip()
            if not email:
                logfile("USER_REGISTRATION: missing email")
                return {
                    "registration_status": "failed",
                    "flag": "no",
                    "_reg_ok": False,
                    "message": "Missing email.",
                }
            if not otp:
                logfile("USER_REGISTRATION: pending_verification (otp not provided)")
                return {
                    "registration_status": "pending_verification",
                    "flag": "yes",
                    "_reg_ok": False,
                    "email": email,
                }
            resp = Login_Form_Verify_Account_Func(email, otp)
            ok = resp.get("status") == "success"
            logfile("USER_REGISTRATION: ok" if ok else f"USER_REGISTRATION: failed msg={resp.get('message')}")
            return {
                "registration_status": "verified" if ok else "failed",
                "flag": "yes" if ok else "no",
                "message": resp.get("message"),
                "_reg_ok": True if ok else False,
                "email": email,
            }
        except Exception as e:
            logfile(f"USER_REGISTRATION: {e}")
            return {"registration_status": "failed", "flag": "no", "message": str(e), "_reg_ok": False}
    finally:
        end_time = time.perf_counter()
        log.info(f"Completed Login_Form_User_Registration_Node in {end_time - start_time:.2f} seconds")


def Login_Form_Sign_In_Node(state: Dict) -> Dict:
    """
    Args:
      - state: dict with 'email_or_phone' and 'password'
    Return:
      - dict: login_status, flag, user (dict|None), user_id (str|None), message
    """
    start_time = time.perf_counter()
    log.info("---SIGN_IN---")
    log.info(f"[DEBUG] Entering node Login_Form_Sign_In_Node with state: {state}")
    try:
        try:
            resp = Login_Form_Login_User_Func(state["email_or_phone"], state["password"])
            logfile(f"SIGN_IN - raw_resp={resp}")
            ok = resp.get("status") == "success"
            user = resp.get("user") or {}
            uid = None
            if user:
                uid = user.get("id") or user.get("_id") or user.get("user_id")
            if ok and not uid:
                try:
                    if "@" in state["email_or_phone"]:
                        q = {"email": state["email_or_phone"].lower()}
                    else:
                        q = {"phone": state["email_or_phone"]}
                    if users_db is not None:
                        db_user = users_db.users.find_one(q)
                        if db_user:
                            uid = str(db_user["_id"])
                            user = {
                                "id": uid,
                                "name": db_user.get("name"),
                                "email": db_user.get("email"),
                                "dob": db_user.get("dob"),
                                "age": db_user.get("age"),
                                "age_group": db_user.get("age_group"),
                            }
                            logfile(f"SIGN_IN: fallback DB lookup success user_id={uid}")
                except Exception as e:
                    logfile(f"SIGN_IN: fallback DB lookup failed: {e}")
            logfile("SIGN_IN: ok" if ok else f"SIGN_IN: {resp.get('message')}")
            return {
                "login_status": resp.get("status"),
                "flag": "yes" if ok else "no",
                "user": user if user else None,
                "user_id": uid,
                "message": resp.get("message"),
            }
        except Exception as e:
            logfile(f"SIGN_IN: {e}")
            return {"login_status": "failed", "flag": "no", "message": str(e)}
    finally:
        end_time = time.perf_counter()
        log.info(f"Completed Login_Form_Sign_In_Node in {end_time - start_time:.2f} seconds")


def Login_Form_Forgot_Password_Node(state: Dict) -> Dict:
    """
    Args:
      - state: dict with 'email' and 'phone'
    Return:
      - dict: password_reset, flag, _reset_token_sent, message, email
    """
    start_time = time.perf_counter()
    log.info("---FORGOT_PASSWORD---")
    log.info(f"[DEBUG] Entering node Login_Form_Forgot_Password_Node with state: {state}")
    try:
        try:
            email = (state.get("email") or "").strip().lower()
            phone = (state.get("phone") or "").strip()
            resp = Login_Form_Forgot_Password_Func(email, phone)
            ok = resp.get("status") == "success"
            logfile("FORGOT_PASSWORD: ok" if ok else f"FORGOT_PASSWORD: failed msg={resp.get('message')}")
            return {
                "password_reset": "sent" if ok else "failed",
                "flag": "yes" if ok else "no",
                "_reset_token_sent": True if ok else False,
                "message": resp.get("message"),
                "email": email,
            }
        except Exception as e:
            logfile(f"FORGOT_PASSWORD: {e}")
            return {"password_reset": "failed", "flag": "no", "_reset_token_sent": False, "message": str(e)}
    finally:
        end_time = time.perf_counter()
        log.info(f"Completed Login_Form_Forgot_Password_Node in {end_time - start_time:.2f} seconds")


def Login_Form_Reset_Password_Node(state: Dict) -> Dict:
    """
    Args:
      - state: dict with 'email', 'reset_token', 'new_password'
    Return:
      - dict: reset_status, flag, _reset_ok, message, email
    """
    start_time = time.perf_counter()
    log.info("---RESET_PASSWORD---")
    log.info(f"[DEBUG] Entering node Login_Form_Reset_Password_Node with state: {state}")
    try:
        try:
            email = (state.get("email") or "").strip().lower()
            token = (state.get("reset_token") or "").strip()
            new_pw = state.get("new_password") or ""
            resp = Login_Form_Reset_Password_Func(email, token, new_pw)
            ok = resp.get("status") == "success"
            logfile("RESET_PASSWORD: ok" if ok else f"RESET_PASSWORD: failed msg={resp.get('message')}")
            return {
                "reset_status": resp.get("status"),
                "flag": "yes" if ok else "no",
                "_reset_ok": True if ok else False,
                "message": resp.get("message"),
                "email": email,
            }
        except Exception as e:
            logfile(f"RESET_PASSWORD: {e}")
            return {"reset_status": "failed", "flag": "no", "_reset_ok": False, "message": str(e)}
    finally:
        end_time = time.perf_counter()
        log.info(f"Completed Login_Form_Reset_Password_Node in {end_time - start_time:.2f} seconds")


def Login_Form_User_Login_Validation_Node(state: Dict) -> Dict:
    """
    Args:
      - state: dict with 'login_status'
    Return:
      - dict: session ('active'|'inactive'), flag
    """
    start_time = time.perf_counter()
    log.info("---USER_LOGIN_VALIDATION---")
    log.info(f"[DEBUG] Entering node Login_Form_User_Login_Validation_Node with state: {state}")
    try:
        if state.get("login_status") == "success":
            logfile("USER_LOGIN_VALIDATION: active")
            return {"session": "active", "flag": "yes"}
        logfile("USER_LOGIN_VALIDATION: inactive")
        return {"session": "inactive", "flag": "no"}
    finally:
        end_time = time.perf_counter()
        log.info(f"Completed Login_Form_User_Login_Validation_Node in {end_time - start_time:.2f} seconds")


def Login_Form_Subscription_Validation_Node(state: Dict) -> Dict:
    """
    Args:
      - state: dict with flag and user/user_id
    Return:
      - dict: subscription status ('active'|'none'|'failed'|'unknown'), flag, user_id, sub_detail
    """
    start_time = time.perf_counter()
    log.info("---SUBSCRIPTION_VALIDATION---")
    log.info(f"[DEBUG] Entering node Login_Form_Subscription_Validation_Node with state: {state}")
    try:
        if state.get("flag") != "yes":
            logfile("SUBSCRIPTION_VALIDATION: skipped")
            return {"subscription": "unknown", "flag": "no"}
        try:
            uid = (state.get("user") or {}).get("id") or state.get("user_id")
            sub = Login_Form_Get_User_Subscription_Func(uid)["subscription"]
            # consider active if a plan_id is set and expires_at (if present) is in future
            plan_id = sub.get("plan_id")
            expires_at = sub.get("ends_at") or sub.get("expires_at") or sub.get("ends_at")
            active = False
            if plan_id:
                if not expires_at:
                    active = True
                else:
                    try:
                        ex = expires_at
                        if not getattr(ex, "tzinfo", None):
                            # assume UTC naive -> treat as UTC
                            ex = ex.replace(tzinfo=timezone.utc)
                        active = ex > datetime.now(timezone.utc)
                    except Exception:
                        active = True
            status = "active" if active else "none"
            logfile(f"SUBSCRIPTION_VALIDATION: {status}")
            return {"subscription": status, "flag": "yes", "user_id": uid, "sub_detail": sub}
        except Exception as e:
            logfile(f"SUBSCRIPTION_VALIDATION: {e}")
            return {"subscription": "failed", "flag": "no", "message": str(e)}
    finally:
        end_time = time.perf_counter()
        log.info(f"Completed Login_Form_Subscription_Validation_Node in {end_time - start_time:.2f} seconds")


def Login_Form_Subscription_Plan_Node(state: Dict) -> Dict:
    """
    Args:
      - state: expects new_plan_id, user_id (or user.id)
               optional billing_cycle ('monthly'|'quarterly'|'yearly'), paid (bool), price (float), transaction_id
    Return:
      - dict: subscription_status ('subscribed'|'pending'|'failed'|'not_subscribed'), flag, message, sub_detail (if available)
    Notes:
      - Delegates to Login_Form_Set_Subscription_Func for consistent pricing, dates, transactions and invoices.
    """
    start_time = time.perf_counter()
    log.info("---SUBSCRIPTION_PLAN---")
    log.info(f"[DEBUG] Entering node Login_Form_Subscription_Plan_Node with state: {state}")
    try:
        if state.get("flag") != "yes":
            logfile("SUBSCRIPTION_PLAN: skipped")
            return {"subscription_status": "not_subscribed", "flag": "no"}
        try:
            new_plan = state.get("new_plan_id")
            uid = state.get("user_id") or (state.get("user") or {}).get("id")
            billing_cycle = (state.get("billing_cycle") or "monthly").strip().lower()
            paid = bool(state.get("paid"))
            price = state.get("price") 
            transaction_id = state.get("transaction_id") or secrets.token_urlsafe(8)

            if not new_plan or not uid:
                logfile("SUBSCRIPTION_PLAN: missing new_plan or user")
                return {"subscription_status": "pending", "flag": "yes"}

            #Write to DB, Email user, Create transaction record etc via helper function
            try:
                resp = Login_Form_Set_Subscription_Func(uid, new_plan, billing_cycle=billing_cycle, paid=paid, price_paid=(float(price) if price is not None else None))
                # resp is the output of Login_Form_Get_User_Subscription_Func
                sub = resp.get("subscription") if isinstance(resp, dict) else None
                log.info("SUBSCRIPTION_PLAN: Set subscription via helper resp=%s", resp)
                if sub:
                    return {"subscription_status": "subscribed", "flag": "yes", "message": "Subscribed", "sub_detail": sub}
                else:
                    return {"subscription_status": "failed", "flag": "no", "message": "Failed to set subscription via helper"}
            except Exception as e:
                logfile(f"SUBSCRIPTION_PLAN: helper failed: {e}")
                #Fallback: Direct DB write and email
                try:
                    now = datetime.now(timezone.utc)
                    months = {"monthly": 1, "quarterly": 3, "yearly": 12}.get(billing_cycle, 1)
                    start_date = now
                    expires_at = now + timedelta(days=30 * months)
                    if subs_db is None:
                        raise RuntimeError("Subs DB not configured")
                    subs_db.subscriptions.update_one(
                        {"user_id": uid},
                        {
                            "$set": {
                                "user_id": uid,
                                "plan_id": new_plan,
                                "billing_cycle": billing_cycle,
                                "starts_at": start_date,
                                "expires_at": expires_at,
                                "paid": paid,
                                "price": float(price) if price is not None else None,
                                "transaction_id": transaction_id,
                                "updated_at": now,
                            }
                        },
                        upsert=True,
                    )
                    txn_user = {
                        "transaction_id": transaction_id,
                        "user_id": uid,
                        "plan_id": new_plan,
                        "billing_cycle": billing_cycle,
                        "price": float(price) if price is not None else None,
                        "paid": paid,
                        "created_at": now,
                    }
                    try:
                        subs_db.transactions.insert_one(txn_user)
                    except Exception as e2:
                        log.warning("Failed to insert user transaction (fallback): %s", e2)
                    try:
                        subs_db.admin_transactions.insert_one(txn_user)
                    except Exception as e2:
                        log.warning("Failed to insert admin transaction (fallback): %s", e2)

                    # notify user
                    try:
                        if users_db is not None:
                            usr = users_db.users.find_one({"_id": ObjectId(uid)})
                            if usr and usr.get("email"):
                                email_to = usr.get("email")
                                subject = f"Subscription updated to {new_plan}"
                                body = (
                                    f"Hello {usr.get('name')},\n\n"
                                    f"Your subscription has been set to plan {new_plan}.\n"
                                    f"Billing cycle: {billing_cycle}\n"
                                    f"Paid: {paid}\n"
                                    f"Price: {price}\n"
                                    f"Valid until: {expires_at.isoformat()}\n\nThank you."
                                )
                                send_email(email_to, subject, body)
                    except Exception as e3:
                        log.warning("Failed to send subscription email (fallback): %s", e3)

                    logfile("SUBSCRIPTION_PLAN: ok (fallback)")
                    return {"subscription_status": "subscribed", "flag": "yes", "message": "Subscribed (fallback)"}
                except Exception as ex2:
                    logfile(f"SUBSCRIPTION_PLAN: fallback failed: {ex2}")
                    return {"subscription_status": "failed", "flag": "no", "message": str(ex2)}
        except Exception as e:
            logfile(f"SUBSCRIPTION_PLAN: {e}")
            return {"subscription_status": "failed", "flag": "no", "message": str(e)}
    finally:
        end_time = time.perf_counter()
        log.info(f"Completed Login_Form_Subscription_Plan_Node in {end_time - start_time:.2f} seconds")


def Login_Form_Subscribed_Node(state: Dict) -> Dict:
    """
    Args:
      - state: dict with flag and user/user_id and possibly login_status
    Return:
      - dict: access ('granted'|'denied'), flag, login_status, user, user_id
    """
    start_time = time.perf_counter()
    log.info("---SUBSCRIBED---")
    log.info(f"[DEBUG] Entering node Login_Form_Subscribed_Node with state: {state}")
    try:
        if state.get("flag") != "yes":
            logfile("SUBSCRIBED: denied")
            return {"access": "denied", "flag": "no"}
        uid = state.get("user_id") or (state.get("user") or {}).get("id")
        logfile("SUBSCRIBED: granted")
        return {
            "access": "granted",
            "flag": "yes",
            "login_status": state.get("login_status", "success"),
            "user": state.get("user"),
            "user_id": uid,
        }
    finally:
        end_time = time.perf_counter()
        log.info(f"Completed Login_Form_Subscribed_Node in {end_time - start_time:.2f} seconds")


def Login_Form_User_Selection_Node(state: Dict) -> Dict:
    """
    Args:
      - state: dict with flag, user_id (or user.id), selection
    Return:
      - dict: selection, flag, user_id
    """
    start_time = time.perf_counter()
    log.info("---USER_SELECTION---")
    log.info(f"[DEBUG] Entering node Login_Form_User_Selection_Node with state: {state}")
    try:
        if state.get("flag") != "yes":
            logfile("USER_SELECTION: skipped")
            return {"selection": None, "flag": "no"}
        uid = state.get("user_id") or (state.get("user") or {}).get("id")
        if not uid:
            logfile("USER_SELECTION: missing user_id")
            return {"selection": None, "flag": "no"}
        choice = state.get("selection")
        logfile(f"USER_SELECTION: {choice}")
        return {"selection": choice, "flag": "yes", "user_id": uid}
    finally:
        end_time = time.perf_counter()
        log.info(f"Completed Login_Form_User_Selection_Node in {end_time - start_time:.2f} seconds")


def Login_Form_Image_Processing_Node(state: Dict) -> Dict:
    """
    Args:
      - state: dict with flag and user_id
    Return:
      - dict: task ('image_done'|'not_processed'|'failed), flag
    """
    start_time = time.perf_counter()
    log.info("---IMAGE_PROCESSING---")
    log.info(f"[DEBUG] Entering node Login_Form_Image_Processing_Node with state: {state}")
    try:
        if state.get("flag") != "yes":
            logfile("IMAGE_PROCESSING: skipped")
            return {"task": "not_processed", "flag": "no"}
        uid = state.get("user_id")
        if not uid:
            logfile("IMAGE_PROCESSING: missing user_id")
            return {"task": "failed", "flag": "no"}
        Login_Form_Use_Feature_Func(uid, "image")
        logfile("IMAGE_PROCESSING: done")
        return {"task": "image_done", "flag": "yes"}
    finally:
        end_time = time.perf_counter()
        log.info(f"Completed Login_Form_Image_Processing_Node in {end_time - start_time:.2f} seconds")


def Login_Form_Report_Processing_Node(state: Dict) -> Dict:
    """
    Args:
      - state: dict with flag and user_id
    Return:
      - dict: task ('report_done'|'not_processed'|'failed'), flag
    """
    start_time = time.perf_counter()
    log.info("---REPORT_PROCESSING---")
    log.info(f"[DEBUG] Entering node Login_Form_Report_Processing_Node with state: {state}")
    try:
        if state.get("flag") != "yes":
            logfile("REPORT_PROCESSING: skipped")
            return {"task": "not_processed", "flag": "no"}
        uid = state.get("user_id")
        if not uid:
            logfile("REPORT_PROCESSING: missing user_id")
            return {"task": "failed", "flag": "no"}
        Login_Form_Use_Feature_Func(uid, "report")
        logfile("REPORT_PROCESSING: done")
        return {"task": "report_done", "flag": "yes"}
    finally:
        end_time = time.perf_counter()
        log.info(f"Completed Login_Form_Report_Processing_Node in {end_time - start_time:.2f} seconds")


# Build graph
workflow = StateGraph(dict)

for name, fn in [
    ("start_router", Login_Form_Start_Router_Node),
    ("sign_up", Login_Form_Sign_Up_Node),
    ("user_registration", Login_Form_User_Registration_Node),
    ("sign_in", Login_Form_Sign_In_Node),
    ("forgot_password", Login_Form_Forgot_Password_Node),
    ("reset_password", Login_Form_Reset_Password_Node),
    ("user_login_validation", Login_Form_User_Login_Validation_Node),
    ("subscription_validation", Login_Form_Subscription_Validation_Node),
    ("subscription_plan", Login_Form_Subscription_Plan_Node),
    ("subscribed", Login_Form_Subscribed_Node),
    ("user_selection", Login_Form_User_Selection_Node),
    ("image_processing", Login_Form_Image_Processing_Node),
    ("report_processing", Login_Form_Report_Processing_Node),
]:
    workflow.add_node(name, fn)

workflow.set_entry_point("start_router")


def _route_start(x: Dict) -> str:
    route = x.get("start_at") or "sign_in"
    mapping = {
        "sign_in": "sign_in",
        "sign_up": "sign_up",
        "user_registration": "user_registration",
        "forgot_password": "forgot_password",
        "reset_password": "reset_password",
        "subscription_validation": "subscription_validation",
        "subscription_plan": "subscription_plan",
        "user_selection": "user_selection",
    }
    return mapping.get(route, "sign_in")


workflow.add_conditional_edges(
    "start_router",
    _route_start,
    {
        "sign_in": "sign_in",
        "sign_up": "sign_up",
        "user_registration": "user_registration",
        "forgot_password": "forgot_password",
        "reset_password": "reset_password",
        "subscription_validation": "subscription_validation",
        "subscription_plan": "subscription_plan",
        "user_selection": "user_selection",
    },
)


def _route_after_user_registration(x: Dict) -> str:
    if x.get("registration_status") == "verified" and x.get("_from_signup") == "yes":
        return "user_login_validation"
    return "end"


workflow.add_conditional_edges(
    "user_registration",
    _route_after_user_registration,
    {"user_login_validation": "user_login_validation", "end": END},
)

workflow.add_edge("sign_in", "user_login_validation")


def _route_after_forgot_password(x: Dict) -> str:
    if x.get("_continue_after_forgot") == "yes":
        return "user_login_validation"
    return "end"


workflow.add_conditional_edges(
    "forgot_password",
    _route_after_forgot_password,
    {"user_login_validation": "user_login_validation", "end": END},
)


def _route_after_reset_password(x: Dict) -> str:
    return "end"


workflow.add_conditional_edges(
    "reset_password",
    _route_after_reset_password,
    {"end": END},
)

workflow.add_edge("user_login_validation", "subscription_validation")


def _route_sub(x: Dict) -> str:
    return "subscribed" if x.get("subscription") == "active" else "subscription_plan"


workflow.add_conditional_edges(
    "subscription_validation",
    _route_sub,
    {"subscribed": "subscribed", "subscription_plan": "subscription_plan"},
)


def _after_subscribed(x: Dict) -> str:
    sel = (x.get("selection") or "").strip().lower()
    return "user_selection" if sel in ("image", "report") else "end"


workflow.add_conditional_edges(
    "subscribed",
    _after_subscribed,
    {"user_selection": "user_selection", "end": END},
)

workflow.add_edge("subscription_plan", "subscribed")


def _route_choice(x: Dict) -> str:
    return "image_processing" if x.get("selection") == "image" else "report_processing"


workflow.add_conditional_edges(
    "user_selection",
    _route_choice,
    {"image_processing": "image_processing", "report_processing": "report_processing"},
)

workflow.add_edge("image_processing", END)
workflow.add_edge("report_processing", END)

graph = workflow.compile()
