package utils

import "testing"

func TestPtr(t *testing.T) {
	t.Run("int", func(t *testing.T) {
		v := 42
		got := Ptr(v)
		if got == nil {
			t.Fatal("expected non-nil pointer")
		}
		if *got != v {
			t.Errorf("expected %d, got %d", v, *got)
		}
	})

	t.Run("string", func(t *testing.T) {
		v := "hello"
		got := Ptr(v)
		if got == nil {
			t.Fatal("expected non-nil pointer")
		}
		if *got != v {
			t.Errorf("expected %q, got %q", v, *got)
		}
	})
}
