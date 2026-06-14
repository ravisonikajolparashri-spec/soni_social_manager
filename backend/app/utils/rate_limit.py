"""
Rate limiting utilities using slowapi (backed by in-memory limits per IP).
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, default_limits=[])
